import type { CustomizeUserGameBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGameBodyDto.type.ts";
import type { CustomizeUserGamePathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGamePathParamDto.type.ts";

import type { CustomizeUserGameBean } from "../../../bean/customizeUserGameBean.type.ts";
import { fromCustomizationDtoToCustomizationInputBean } from "./fromCustomizationDtoToCustomizationInputBean.ts";

export function fromCustomizeUserGameDtoToCustomizeUserGameBean(
	pathParamDto: CustomizeUserGamePathParamDto,
	bodyDto: CustomizeUserGameBodyDto,
): CustomizeUserGameBean {
	return {
		gameId: pathParamDto.gameId,
		customization: fromCustomizationDtoToCustomizationInputBean(bodyDto),
	};
}
