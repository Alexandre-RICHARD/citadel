import type { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import type { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import type { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";

// Où en est un parcours, tel que le navigateur peut le savoir : ni compte, ni adresse, ni empreinte
export type FlowBean = {
	kind: FlowKindEnum;
	step: FlowStepEnum;
	expiresAt: Date;
	// null : aucun mail envoyé à cette étape, un premier peut partir tout de suite (ou l'étape n'en envoie pas)
	resendAvailableAt: Date | null;
	remainingAttempts: number;
	// Étape « second facteur » : ce que le compte peut y donner. Vide à toute autre étape
	secondFactorMethods: SecondFactorMethodEnum[];
};
