import { randomInt } from "node:crypto";

import { computeHmacSha256 } from "@citadel/common/src/node/crypto/computeHmacSha256.ts";
import { createRandomToken } from "@citadel/common/src/node/crypto/createRandomToken.ts";
import { hashSha256 } from "@citadel/common/src/node/crypto/hashSha256.ts";
import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths.ts";

import type { FlowSecretsBean } from "../../bean/flowSecretsBean.type.ts";

const CODE_POSSIBILITIES = 10 ** AUTH_FIELD_LENGTHS.mailCode;

/**
 * Un code de 6 chiffres et un lien de 32 octets, tirés au hasard. Le code, court, n'est gardé qu'en HMAC (sans la clé, la
 * base ne permet pas d'essayer le million de codes) ; le jeton du lien, impossible à deviner, en SHA-256
 */
export function createFlowSecrets(hmacKey: string): FlowSecretsBean {
	const code = String(randomInt(0, CODE_POSSIBILITIES)).padStart(
		AUTH_FIELD_LENGTHS.mailCode,
		"0",
	);
	const linkToken = createRandomToken();
	return {
		code,
		linkToken,
		codeHmac: computeHmacSha256(hmacKey, code),
		linkTokenHash: hashSha256(linkToken),
	};
}
