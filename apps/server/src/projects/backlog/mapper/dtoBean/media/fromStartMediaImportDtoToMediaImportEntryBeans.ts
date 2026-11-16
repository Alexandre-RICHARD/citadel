import type { StartMediaImportBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/mediaImports/startMediaImport/startMediaImportBodyDto.type.ts";

import type { MediaImportEntryBean } from "../../../bean/mediaImportEntryBean.type.ts";

export function fromStartMediaImportDtoToMediaImportEntryBeans(
	bodyDto: StartMediaImportBodyDto,
): MediaImportEntryBean[] {
	return bodyDto.entries.map(({ mediaType, tmdbId }) => ({
		mediaType,
		tmdbId,
	}));
}
