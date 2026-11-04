import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum";

type SecondFactorAnswer = {
	method: SecondFactorMethodEnum.TOTP | SecondFactorMethodEnum.RECOVERY_CODE;
	code: string;
};

const TOTP_CODE = /^\d{6}$/u;

/**
 * Un seul champ pour le code de l'application (6 chiffres) ou un code de secours (10 lettres et chiffres, tiret
 * facultatif) : les deux ne se confondent jamais. null : rien de tapé
 */
export function readSecondFactorAnswer(
	typed: string,
): SecondFactorAnswer | null {
	const code = typed.replace(/[\s-]/gu, "");
	if (code === "") return null;
	return {
		method: TOTP_CODE.test(code)
			? SecondFactorMethodEnum.TOTP
			: SecondFactorMethodEnum.RECOVERY_CODE,
		code,
	};
}
