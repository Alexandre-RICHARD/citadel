import type { FlowKindEnum } from "../enum/flowKind.enum.ts";
import type { FlowStepEnum } from "../enum/flowStep.enum.ts";

// Le parcours en cours dans ce navigateur. Durées en secondes, jamais en dates : l'horloge du navigateur peut avancer ou
// retarder sur celle du serveur
export type FlowDto = {
	kind: FlowKindEnum;
	step: FlowStepEnum;
	// Avant que le parcours expire : il faudra alors recommencer
	expiresIn: number;
	// Avant qu'un nouveau mail puisse être demandé ; null : il peut l'être tout de suite, ou l'étape n'envoie pas de mail
	resendRetryAfter: number | null;
	// Codes qui peuvent encore être essayés ; à zéro, il faut en redemander un
	remainingAttempts: number;
};
