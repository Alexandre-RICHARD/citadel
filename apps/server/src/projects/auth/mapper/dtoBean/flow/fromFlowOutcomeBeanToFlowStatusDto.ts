import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";

import type { FlowOutcomeBean } from "../../../bean/flowOutcomeBean.type.ts";
import { fromFlowBeanToFlowStatusDto } from "./fromFlowBeanToFlowStatusDto.ts";

// Terminé : plus de parcours, la session est ouverte
export function fromFlowOutcomeBeanToFlowStatusDto(
	outcome: FlowOutcomeBean,
	now: Date,
): FlowStatusDto {
	return fromFlowBeanToFlowStatusDto(
		outcome.isCompleted ? null : outcome.flow,
		now,
	);
}
