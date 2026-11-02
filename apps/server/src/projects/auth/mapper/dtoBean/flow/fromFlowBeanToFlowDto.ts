import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";
import type { FlowDto } from "@citadel/specs/src/projects/auth/dto/flowDto.type.ts";

import type { FlowBean } from "../../../bean/flowBean.type.ts";

// Secondes entamées : le compte à rebours du navigateur n'arrive jamais à zéro avant le serveur
function secondsUntil(date: Date, now: Date): number {
	return Math.max(
		0,
		Math.ceil((date.getTime() - now.getTime()) / DurationMsEnum.SECOND),
	);
}

export function fromFlowBeanToFlowDto(flow: FlowBean, now: Date): FlowDto {
	const resendRetryAfter =
		flow.resendAvailableAt === null
			? null
			: secondsUntil(flow.resendAvailableAt, now);
	return {
		kind: flow.kind,
		step: flow.step,
		expiresIn: secondsUntil(flow.expiresAt, now),
		resendRetryAfter: resendRetryAfter === 0 ? null : resendRetryAfter,
		remainingAttempts: flow.remainingAttempts,
	};
}
