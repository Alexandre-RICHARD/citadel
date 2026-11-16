import type { TmdbImagesResponse } from "./type/tmdbImagesResponse.type.ts";

/**
 * Les affiches proposées pour la miniature : celle que TMDB met en avant pour le français d'abord (la première, prise
 * d'office à l'import), puis les autres, sans doublon
 */
export function listTmdbPosterPaths(
	defaultPosterPath: string | null,
	images: TmdbImagesResponse,
): string[] {
	const paths = (images.posters ?? []).map(({ file_path }) => file_path);
	return [
		...new Set(
			defaultPosterPath === null ? paths : [defaultPosterPath, ...paths],
		),
	];
}
