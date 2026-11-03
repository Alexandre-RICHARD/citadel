import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";

import type { FlowOutcomeBean } from "../../../bean/flowOutcomeBean.type.ts";
import { fromFlowBeanToFlowStatusDto } from "./fromFlowBeanToFlowStatusDto.ts";

// Terminé : plus de parcours ; les codes de secours seulement quand le parcours en donne
export function fromFlowOutcomeBeanToFlowStatusDto(
	outcome: FlowOutcomeBean,
	now: Date,
): FlowStatusDto {
	if (!outcome.isCompleted)
		return fromFlowBeanToFlowStatusDto(outcome.flow, now);
	return {
		flow: null,
		...(outcome.recoveryCodes !== null && {
			recoveryCodes: outcome.recoveryCodes,
		}),
	};
}
