import { createConcurrencyLimiter } from "../../universal/limit/createConcurrencyLimiter.ts";
import type { Argon2Parameters } from "./argon2Parameters.type.ts";
import { hashPassword } from "./hashPassword.ts";
import { needsPasswordRehash } from "./needsPasswordRehash.ts";
import { verifyPassword } from "./verifyPassword.ts";

type Options = {
	parameters: Argon2Parameters;
	// Hashs calculés en même temps, puis en attente, au plus : chacun prend `memoryKib` de mémoire
	concurrency: number;
	queueMax: number;
};

/**
 * Hash et vérification des mots de passe d'un serveur à la mémoire comptée : au-delà de la file d'attente, QueueFullError
 * (le serveur répond alors 503 avec Retry-After). La détection « à refaire » ne calcule rien, elle passe sans attendre
 */
export function createPasswordHasher({
	parameters,
	concurrency,
	queueMax,
}: Options) {
	const limiter = createConcurrencyLimiter({ concurrency, queueMax });

	return {
		hash: async (password: string): Promise<string> =>
			limiter.run(async () => hashPassword(password, parameters)),
		verify: async (password: string, storedHash: string): Promise<boolean> =>
			limiter.run(async () => verifyPassword(password, storedHash)),
		needsRehash: (storedHash: string): boolean =>
			needsPasswordRehash(storedHash, parameters),
	};
}
