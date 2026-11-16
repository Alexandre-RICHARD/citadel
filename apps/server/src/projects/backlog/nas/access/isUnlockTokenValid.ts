import { computeHmacSha256 } from "@citadel/common/src/node/crypto/computeHmacSha256.ts";
import { isEqualInConstantTime } from "@citadel/common/src/node/crypto/isEqualInConstantTime.ts";

const TOKEN_PATTERN = /^(\d+)\.(\d+)\.([\w-]+)$/;

// Le jeton ouvre-t-il le mode connecté à ce compte, maintenant ? Signature, compte et date de fin vérifiés
export function isUnlockTokenValid(
	token: string | undefined,
	userId: number,
	key: string,
	nowMs: number,
): boolean {
	const match = token === undefined ? null : TOKEN_PATTERN.exec(token);
	if (match === null) return false;
	const [, tokenUserId = "", expiresAtMs = "", signature = ""] = match;
	const expected = computeHmacSha256(key, `${tokenUserId}.${expiresAtMs}`);
	return (
		isEqualInConstantTime(Buffer.from(signature, "base64url"), expected) &&
		Number(tokenUserId) === userId &&
		Number(expiresAtMs) > nowMs
	);
}
