import type { CreateUserGameBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameBodyDto.type.ts";

import type { CustomizationInputBean } from "../../../bean/customizationInputBean.type.ts";

export function fromCustomizationDtoToCustomizationInputBean(
	customizationDto: CreateUserGameBodyDto["customization"],
): CustomizationInputBean {
	return {
		imageId: customizationDto.imageId,
		endingType: customizationDto.endingType,
		series: customizationDto.series,
		seriesNumber: customizationDto.seriesNumber,
	};
}
