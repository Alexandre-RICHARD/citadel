import type { DeleteUserMediaPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/deleteUserMedia/deleteUserMediaPathParamDto.type.ts";

import type { UserMediaIdBean } from "../../../bean/userMediaIdBean.type.ts";

export function fromDeleteUserMediaDtoToUserMediaIdBean(
	pathParamDto: DeleteUserMediaPathParamDto,
): UserMediaIdBean {
	return { userMediaId: pathParamDto.userMediaId };
}
