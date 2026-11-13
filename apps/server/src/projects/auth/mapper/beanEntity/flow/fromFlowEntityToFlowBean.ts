import type { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";

import type { FlowBean } from "../../../bean/flowBean.type.ts";
import type { Flow } from "../../../models/Flow.ts";

type CodeSettings = {
	maxAttempts: number;
	resendDelayMs: number;
};

// Un leurre se lit comme un vrai parcours : mêmes dates, mêmes essais, rien de son compte. Chaque étape repart sans
// email envoyé (lastSentAt remis à null) : le délai de renvoi ne vaut qu'après un envoi de cette étape
export function fromFlowEntityToFlowBean(
	flow: Pick<Flow, "kind" | "step" | "expiresAt" | "lastSentAt" | "attempts">,
	{ maxAttempts, resendDelayMs }: CodeSettings,
	secondFactorMethods: SecondFactorMethodEnum[],
): FlowBean {
	return {
		kind: flow.kind,
		step: flow.step,
		expiresAt: flow.expiresAt,
		resendAvailableAt:
			flow.lastSentAt === null
				? null
				: new Date(flow.lastSentAt.getTime() + resendDelayMs),
		remainingAttempts: Math.max(0, maxAttempts - flow.attempts),
		secondFactorMethods,
	};
}
