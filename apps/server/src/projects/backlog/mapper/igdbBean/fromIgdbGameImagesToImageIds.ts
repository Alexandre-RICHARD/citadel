import type { IgdbGameImages } from "../../igdb/type/igdbGameImages.type.ts";

// Images proposées pour la miniature (cahier des charges, §8) : la cover d'abord, puis les artworks
export function fromIgdbGameImagesToImageIds({
	cover,
	artworks = [],
}: IgdbGameImages): string[] {
	return [
		...(cover === undefined ? [] : [cover.image_id]),
		...artworks.map(({ image_id: imageId }) => imageId),
	];
}
