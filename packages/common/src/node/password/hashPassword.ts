import { randomBytes } from "node:crypto";

import type { Argon2Parameters } from "./argon2Parameters.type.ts";
import { deriveArgon2id } from "./deriveArgon2id.ts";
import { formatPasswordHash } from "./formatPasswordHash.ts";

const SALT_BYTES = 16;

// Le hash à stocker : un sel neuf à chaque appel, donc deux hashs différents pour un même mot de passe
export async function hashPassword(
	password: string,
	parameters: Argon2Parameters,
): Promise<string> {
	const salt = randomBytes(SALT_BYTES);
	const digest = await deriveArgon2id(password, salt, parameters);
	return formatPasswordHash({ parameters, salt, digest });
}
