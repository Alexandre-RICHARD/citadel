import path from "node:path";

import type { DiskFile } from "../disk/diskFile.type.ts";
import { isVideoFile } from "../disk/isVideoFile.ts";
import { parseEpisodeNumbers } from "../disk/parseEpisodeNumbers.ts";
import { distinctByInode } from "./distinctByInode.ts";
import type { LinkContext } from "./linkContext.type.ts";

// Les fichiers vidéo distincts du dossier d'un épisode qui portent ses numéros : plus d'un fait un doublon
export function sameEpisodeFiles(
	context: Pick<LinkContext, "disk">,
	mainFile: DiskFile,
	seasonNumber: number,
	episodeNumber: number,
): DiskFile[] {
	const folder = `${path.posix.dirname(mainFile.path)}/`;
	return distinctByInode([
		mainFile,
		...context.disk
			.under(folder)
			.filter(
				(file) =>
					path.posix.dirname(file.path) === path.posix.dirname(mainFile.path),
			)
			.filter((file) => {
				const numbers = parseEpisodeNumbers(path.posix.basename(file.path));
				return (
					isVideoFile(file.path) &&
					numbers?.seasonNumber === seasonNumber &&
					numbers.episodeNumber === episodeNumber
				);
			}),
	]);
}
