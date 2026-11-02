import type { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import type { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";

// Où en est un parcours, tel que le navigateur peut le savoir : ni compte, ni adresse, ni empreinte
export type FlowBean = {
	kind: FlowKindEnum;
	step: FlowStepEnum;
	expiresAt: Date;
	// null : l'étape n'envoie pas de mail
	resendAvailableAt: Date | null;
	remainingAttempts: number;
};
