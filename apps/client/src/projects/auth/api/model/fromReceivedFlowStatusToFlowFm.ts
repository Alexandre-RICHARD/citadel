import type { FlowFm } from "./flowFm.type";
import type { ReceivedFlowStatus } from "./receivedFlowStatus.type";

const SECOND_MS = 1000;

// null : plus de parcours dans ce navigateur
export function fromReceivedFlowStatusToFlowFm({
	status,
	receivedAt,
}: ReceivedFlowStatus): FlowFm | null {
	const { flow } = status;
	if (flow === null) return null;
	return {
		kind: flow.kind,
		step: flow.step,
		expiresAt: receivedAt + flow.expiresIn * SECOND_MS,
		resendAvailableAt:
			flow.resendRetryAfter === null
				? null
				: receivedAt + flow.resendRetryAfter * SECOND_MS,
		remainingAttempts: flow.remainingAttempts,
	};
}
