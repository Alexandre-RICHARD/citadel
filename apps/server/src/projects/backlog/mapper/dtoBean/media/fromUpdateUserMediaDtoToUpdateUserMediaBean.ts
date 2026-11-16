import type { UpdateUserMediaBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/updateUserMedia/updateUserMediaBodyDto.type.ts";
import type { UpdateUserMediaPathParamDto } from "@citadel/specs/src/projects/backlog/endpoint/userMedia/updateUserMedia/updateUserMediaPathParamDto.type.ts";

import type { UpdateUserMediaBean } from "../../../bean/updateUserMediaBean.type.ts";

// Seuls les champs envoyés : un champ absent ne change pas
export function fromUpdateUserMediaDtoToUpdateUserMediaBean(
	pathParamDto: UpdateUserMediaPathParamDto,
	bodyDto: UpdateUserMediaBodyDto,
): UpdateUserMediaBean {
	return {
		userMediaId: pathParamDto.userMediaId,
		changes: {
			...(bodyDto.isWatched !== undefined && { isWatched: bodyDto.isWatched }),
			...(bodyDto.isUpNext !== undefined && { isUpNext: bodyDto.isUpNext }),
			...(bodyDto.isInProgress !== undefined && {
				isInProgress: bodyDto.isInProgress,
			}),
			...(bodyDto.comment !== undefined && { comment: bodyDto.comment }),
		},
	};
}
