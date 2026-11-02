import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";

import type { FlowBean } from "../../../bean/flowBean.type.ts";
import { fromFlowBeanToFlowDto } from "./fromFlowBeanToFlowDto.ts";

// null : plus de parcours (terminé, expiré, abandonné, ou jamais commencé)
export function fromFlowBeanToFlowStatusDto(
	flow: FlowBean | null,
	now: Date,
): FlowStatusDto {
	return { flow: flow === null ? null : fromFlowBeanToFlowDto(flow, now) };
}
