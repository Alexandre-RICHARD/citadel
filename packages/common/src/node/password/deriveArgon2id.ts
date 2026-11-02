import { argon2 } from "node:crypto";

import type { Argon2Parameters } from "./argon2Parameters.type.ts";

const PASSWORD_DIGEST_BYTES = 32;

// argon2id natif de Node, hors du fil principal : le serveur continue de répondre pendant le calcul. Le mot de passe est
// normalisé en NFC : « é » tapé d'une touche ou composé de « e » et d'un accent donne le même hash
export function deriveArgon2id(
	password: string,
	salt: Buffer,
	{ memoryKib, passes, parallelism }: Argon2Parameters,
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		argon2(
			"argon2id",
			{
				message: password.normalize("NFC"),
				nonce: salt,
				memory: memoryKib,
				passes,
				parallelism,
				tagLength: PASSWORD_DIGEST_BYTES,
			},
			(error, digest) => {
				if (error === null) resolve(digest);
				else reject(error);
			},
		);
	});
}
