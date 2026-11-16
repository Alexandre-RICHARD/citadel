import { externalLinks } from "@citadel/specs/src/links/externalLinks";

import type { TmdbImageSizeEnum } from "./tmdbImageSize.enum";

// Seule fonction qui construit l'URL d'une image TMDB : `path` commence par « / » (« /abc.jpg »)
export function getTmdbImageUrl(path: string, size: TmdbImageSizeEnum): string {
	return `${externalLinks.tmdbImages}/${size}${path}`;
}
