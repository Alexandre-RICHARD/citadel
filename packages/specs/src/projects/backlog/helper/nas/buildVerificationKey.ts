import type { VerificationTarget } from "./verificationTarget.type.ts";

/**
 * La clé d'une case « Vérifié » dans verified/verified.json : « movie:603 » pour un film, « episode:1396:2:5 » pour
 * l'épisode 5 de la saison 2 d'une série. Par identifiants TMDB, comme le relevé : elle survit à un retrait du backlog
 * suivi d'un nouvel ajout
 */
export function buildVerificationKey(target: VerificationTarget): string {
	return target.kind === "movie"
		? `movie:${target.tmdbId}`
		: `episode:${target.showTmdbId}:${target.seasonNumber}:${target.episodeNumber}`;
}
