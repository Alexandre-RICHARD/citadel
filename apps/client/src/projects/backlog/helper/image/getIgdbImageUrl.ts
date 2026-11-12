import { externalLinks } from "@citadel/specs/src/links/externalLinks";

import type { IgdbImageSizeEnum } from "./igdbImageSize.enum";

// Seule fonction qui construit l'URL d'une image IGDB ; suffixe _2x pour les écrans haute densité
export function getIgdbImageUrl(
	imageId: string,
	size: IgdbImageSizeEnum,
	isHighDensity = false,
): string {
	return `${externalLinks.igdbImages}/t_${size}${isHighDensity ? "_2x" : ""}/${imageId}.jpg`;
}
