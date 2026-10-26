import type { CreateUserGameBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameBodyDto.type.ts";

import type { CreateUserGameBean } from "../../../bean/createUserGameBean.type.ts";
import { fromNewUserVersionDtoToNewUserVersionBean } from "../userVersion/fromNewUserVersionDtoToNewUserVersionBean.ts";
import { fromCustomizationDtoToCustomizationInputBean } from "./fromCustomizationDtoToCustomizationInputBean.ts";

export function fromCreateUserGameDtoToCreateUserGameBean(
	bodyDto: CreateUserGameBodyDto,
): CreateUserGameBean {
	return {
		gameId: bodyDto.gameId,
		customization: fromCustomizationDtoToCustomizationInputBean(
			bodyDto.customization,
		),
		userVersion: fromNewUserVersionDtoToNewUserVersionBean(bodyDto.userVersion),
	};
}
