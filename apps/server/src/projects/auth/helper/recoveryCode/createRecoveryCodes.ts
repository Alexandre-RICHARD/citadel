import { randomBytes } from "node:crypto";

import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths.ts";

import { encodeBase32 } from "../../totp/encodeBase32.ts";
import { hashRecoveryCode } from "./hashRecoveryCode.ts";

// 7 octets donnent 11 caractères Base32 (56 bits) : les 10 premiers suffisent, chacun tiré de 5 bits au hasard
const RANDOM_BYTES_PER_CODE = 7;

type RecoveryCodes = {
	// À montrer une seule fois, « ABCDE-FGHIJ »
	codes: string[];
	// À garder en base, dans le même ordre
	codeHashes: Buffer[];
};

function formatRecoveryCode(code: string): string {
	const { recoveryCodeGroup } = AUTH_FIELD_LENGTHS;
	return `${code.slice(0, recoveryCodeGroup)}-${code.slice(recoveryCodeGroup)}`;
}

function drawRecoveryCode(): string {
	return encodeBase32(randomBytes(RANDOM_BYTES_PER_CODE)).slice(
		0,
		AUTH_FIELD_LENGTHS.recoveryCode,
	);
}

/**
 * `count` codes de secours à usage unique, tous différents : 10 caractères Base32 (50 bits), affichés en deux groupes
 * de 5. Un code tapé se compare par son empreinte, sans le tiret
 */
export function createRecoveryCodes(
	count: number,
	hmacKey: string,
): RecoveryCodes {
	const uniqueCodes = new Set<string>();
	while (uniqueCodes.size < count) uniqueCodes.add(drawRecoveryCode());
	const codes = [...uniqueCodes];
	return {
		codes: codes.map(formatRecoveryCode),
		codeHashes: codes.map((code) => hashRecoveryCode(hmacKey, code)),
	};
}
