import type { CustomizeUserMediaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/customizeUserMedia/customizeUserMediaBodyDto.type.ts";
import type { CustomizeUserMediaPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/customizeUserMedia/customizeUserMediaPathParamDto.type.ts";

import type { CustomizeUserMediaBean } from "../../../bean/customizeUserMediaBean.type.ts";
import { fromMediaCustomizationDtoToMediaCustomizationBean } from "./fromMediaCustomizationDtoToMediaCustomizationBean.ts";

export function fromCustomizeUserMediaDtoToCustomizeUserMediaBean(
	pathParamDto: CustomizeUserMediaPathParamDto,
	bodyDto: CustomizeUserMediaBodyDto,
): CustomizeUserMediaBean {
	return {
		userMediaId: pathParamDto.userMediaId,
		customization: fromMediaCustomizationDtoToMediaCustomizationBean(bodyDto),
	};
}
