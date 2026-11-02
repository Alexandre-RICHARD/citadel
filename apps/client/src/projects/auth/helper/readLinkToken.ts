import { linkTokenSchema } from "@citadel/specs/src/projects/auth/schema/linkTokenSchema";

// Le jeton du lien d'un mail, dans le fragment de l'adresse (/auth/verify#…) ; null s'il manque ou a été abîmé (un
// lien coupé en deux par une messagerie)
export function readLinkToken(hash: string): string | null {
	const result = linkTokenSchema.safeParse(hash.replace(/^#/u, ""));
	return result.success ? result.data : null;
}
