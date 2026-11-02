import { createRandomToken } from "@citadel/common/src/node/crypto/createRandomToken.ts";
import { createPasswordHasher } from "@citadel/common/src/node/password/createPasswordHasher.ts";
import { QueueFullError } from "@citadel/common/src/universal/limit/QueueFullError.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { authSettings } from "../../../configuration/authSettings.ts";
import { ServiceUnavailableError } from "../../../error/ServiceUnavailableError.ts";

// Un hash dure quelques dizaines de millisecondes : réessayer une seconde plus tard suffit
const BUSY_RETRY_AFTER_MS = 1000;

/**
 * Les mots de passe, hashés en argon2id avec les paramètres du moment, sous le plafond de mémoire du serveur : au-delà
 * de la file d'attente, 503 AUTH_BUSY avec Retry-After
 */
class PasswordService {
	readonly #hasher = createPasswordHasher(authSettings.passwordHashing);

	// Le hash d'un mot de passe que personne ne connaît, calculé une fois : un identifiant inconnu coûte une vraie
	// vérification, au même prix qu'un mauvais mot de passe
	#dummyHash: Promise<string> | null = null;

	async hash(password: string): Promise<string> {
		return this.#whenNotBusy(async () => this.#hasher.hash(password));
	}

	// Sans hash (identifiant inconnu), vérifie contre le hash factice : même durée, toujours faux
	async verify(password: string, storedHash: string | null): Promise<boolean> {
		const hash = storedHash ?? (await this.#getDummyHash());
		const isValid = await this.#whenNotBusy(async () =>
			this.#hasher.verify(password, hash),
		);
		return storedHash !== null && isValid;
	}

	needsRehash(storedHash: string): boolean {
		return this.#hasher.needsRehash(storedHash);
	}

	async #getDummyHash(): Promise<string> {
		this.#dummyHash ??= this.hash(createRandomToken());
		try {
			return await this.#dummyHash;
		} catch (error) {
			// Pas de hash factice resté en échec (serveur occupé au premier calcul) : le suivant réessaie
			this.#dummyHash = null;
			throw error;
		}
	}

	async #whenNotBusy<Result>(task: () => Promise<Result>): Promise<Result> {
		try {
			return await task();
		} catch (error) {
			if (error instanceof QueueFullError)
				throw new ServiceUnavailableError(
					AuthErrorCodeEnum.AUTH_BUSY,
					"Too many passwords to hash at the same time",
					BUSY_RETRY_AFTER_MS,
				);
			throw error;
		}
	}
}

export const passwordService = new PasswordService();
