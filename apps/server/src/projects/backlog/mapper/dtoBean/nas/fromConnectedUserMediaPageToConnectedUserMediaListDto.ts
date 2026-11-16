import type { ConnectedUserMediaListDto } from "@citadel/specs/src/projects/backlog/dto/nas/connectedUserMediaListDto.type.ts";

import type { ConnectedUserMediaBean } from "../../../bean/connectedUserMediaBean.type.ts";
import type { buildUserMediaPage } from "../../../helper/buildUserMediaPage.ts";
import { fromUserMediaBeanToUserMediaDto } from "../media/fromUserMediaBeanToUserMediaDto.ts";
import { fromNasDetailsBeanToNasDetailsDto } from "./fromNasDetailsBeanToNasDetailsDto.ts";

export function fromConnectedUserMediaPageToConnectedUserMediaListDto(
	page: ReturnType<typeof buildUserMediaPage<ConnectedUserMediaBean>>,
): ConnectedUserMediaListDto {
	return {
		userMedia: page.userMedia.map((userMedia) => ({
			...fromUserMediaBeanToUserMediaDto(userMedia),
			nas: fromNasDetailsBeanToNasDetailsDto(userMedia.nas),
		})),
		matchedCount: page.matchedCount,
		movieCount: page.movieCount,
		showCount: page.showCount,
		originalLanguages: page.originalLanguages,
	};
}
