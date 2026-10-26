import type { GameImagesDto } from "@citadel/specs/src/projects/backlog/dto/igdb/gameImagesDto.type.ts";

export function fromImageIdsToGameImagesDto(imageIds: string[]): GameImagesDto {
	return { imageIds };
}
