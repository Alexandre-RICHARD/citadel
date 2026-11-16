import type { VerificationTarget } from "./verificationTarget.type.ts";

const MOVIE_KEY = /^movie:(\d+)$/;
const EPISODE_KEY = /^episode:(\d+):(\d+):(\d+)$/;

// L'inverse de buildVerificationKey ; null pour une clé illisible (fichier écrit à la main, autre version)
export function parseVerificationKey(key: string): VerificationTarget | null {
	const movie = MOVIE_KEY.exec(key);
	if (movie !== null) return { kind: "movie", tmdbId: Number(movie[1]) };
	const episode = EPISODE_KEY.exec(key);
	if (episode === null) return null;
	return {
		kind: "episode",
		showTmdbId: Number(episode[1]),
		seasonNumber: Number(episode[2]),
		episodeNumber: Number(episode[3]),
	};
}
