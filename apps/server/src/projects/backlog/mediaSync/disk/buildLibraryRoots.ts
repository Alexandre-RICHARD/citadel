import type { LibraryRoots } from "./libraryRoots.type.ts";

export function buildLibraryRoots(dataDir: string): LibraryRoots {
	const root = dataDir.replace(/\/+$/, "");
	return {
		movies: `${root}/medias/movies/`,
		moviesArchives: `${root}/medias/movies_archives/`,
		series: `${root}/medias/series/`,
		medias: `${root}/medias/`,
		// Torrents qui ne sont pas des médias (logiciels, jeux) : comptés, ignorés ailleurs
		otherTorrents: `${root}/torrents/other/`,
	};
}
