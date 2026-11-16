import type { NasDetailsDto } from "@citadel/specs/src/projects/backlog/dto/nas/nasDetailsDto.type.ts";

import type { NasDetailsBean } from "../../../nas/merge/nasDetailsBean.type.ts";

export function fromNasDetailsBeanToNasDetailsDto(
	nas: NasDetailsBean,
): NasDetailsDto {
	return {
		...nas,
		torrents: nas.torrents.map((torrent) => ({ ...torrent })),
		languageTags: nas.languageTags.map((languageTag) => ({ ...languageTag })),
		gaps: nas.gaps.map((gap) => ({ ...gap })),
	};
}
