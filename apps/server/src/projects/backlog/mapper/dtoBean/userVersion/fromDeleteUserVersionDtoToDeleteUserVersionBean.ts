import type { DeleteUserVersionPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/deleteUserVersion/deleteUserVersionPathParamDto.type.ts";

import type { DeleteUserVersionBean } from "../../../bean/deleteUserVersionBean.type.ts";

export function fromDeleteUserVersionDtoToDeleteUserVersionBean(
	pathParamDto: DeleteUserVersionPathParamDto,
): DeleteUserVersionBean {
	return { id: pathParamDto.id };
}
