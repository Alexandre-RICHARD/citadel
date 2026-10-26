import type { CreateUserVersionBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionBodyDto.type.ts";
import type { CreateUserVersionPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionPathParamDto.type.ts";

import type { CreateUserVersionBean } from "../../../bean/createUserVersionBean.type.ts";
import { fromNewUserVersionDtoToNewUserVersionBean } from "./fromNewUserVersionDtoToNewUserVersionBean.ts";

export function fromCreateUserVersionDtoToCreateUserVersionBean(
	pathParamDto: CreateUserVersionPathParamDto,
	bodyDto: CreateUserVersionBodyDto,
): CreateUserVersionBean {
	return {
		gameId: pathParamDto.gameId,
		userVersion: fromNewUserVersionDtoToNewUserVersionBean(bodyDto),
	};
}
