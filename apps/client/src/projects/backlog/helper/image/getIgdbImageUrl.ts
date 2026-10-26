import type { IgdbImageSizeEnum } from "./igdbImageSize.enum";

const IGDB_IMAGE_URL = "https://images.igdb.com/igdb/image/upload";

// Seule fonction qui construit l'URL d'une image IGDB (cahier des charges, §4) ; suffixe _2x pour les écrans haute densité
export function getIgdbImageUrl(
	imageId: string,
	size: IgdbImageSizeEnum,
	isHighDensity = false,
): string {
	return `${IGDB_IMAGE_URL}/t_${size}${isHighDensity ? "_2x" : ""}/${imageId}.jpg`;
}
