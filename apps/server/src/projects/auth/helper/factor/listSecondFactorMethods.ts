import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";

type SecondFactorFacts = {
	kind: FlowKindEnum;
	// Les types des facteurs actifs du compte, un par facteur
	factorTypes: FactorTypeEnum[];
	remainingRecoveryCodes: number;
};

/**
 * Ce que l'étape « second facteur » accepte : le TOTP s'il existe ; le code par email après un mot de passe seulement
 * (après un email, la boîte vient d'être prouvée : elle ne prouve rien de plus) ; un code de secours s'il en reste
 */
export function listSecondFactorMethods({
	kind,
	factorTypes,
	remainingRecoveryCodes,
}: SecondFactorFacts): SecondFactorMethodEnum[] {
	const methods: SecondFactorMethodEnum[] = [];
	if (factorTypes.includes(FactorTypeEnum.TOTP))
		methods.push(SecondFactorMethodEnum.TOTP);
	if (kind === FlowKindEnum.LOGIN && factorTypes.includes(FactorTypeEnum.EMAIL))
		methods.push(SecondFactorMethodEnum.EMAIL);
	if (remainingRecoveryCodes > 0)
		methods.push(SecondFactorMethodEnum.RECOVERY_CODE);
	return methods;
}
