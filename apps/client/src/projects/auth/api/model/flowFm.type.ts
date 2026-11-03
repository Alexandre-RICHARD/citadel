import type { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";
import type { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum";
import type { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum";

// Le parcours en cours, ses échéances en heure du navigateur (millisecondes) : un compte à rebours s'en déduit
export type FlowFm = {
	kind: FlowKindEnum;
	step: FlowStepEnum;
	expiresAt: number;
	// null : un nouveau mail peut être demandé tout de suite, ou l'étape n'en envoie pas
	resendAvailableAt: number | null;
	remainingAttempts: number;
	// Étape « second facteur » : ce que le compte peut y donner. Vide à toute autre étape
	secondFactorMethods: SecondFactorMethodEnum[];
};
