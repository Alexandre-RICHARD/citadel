import type { BacklogMediaRef } from "./backlogMediaRef.type.ts";
import { matchesFolder } from "./matchesFolder.ts";
import type { SurveyedCandidate } from "./surveyedCandidate.type.ts";

type Rule = (candidate: SurveyedCandidate, ref: BacklogMediaRef) => boolean;

// Du plus sûr au moins sûr : chaque règle passe sur tout le backlog avant la suivante
const RULES: Rule[] = [
	(candidate, ref) => candidate.tmdbId === ref.tmdbId,
	(candidate, ref) =>
		candidate.toolTmdbId === ref.tmdbId ||
		candidate.jellyfinTmdbId === ref.tmdbId,
	(candidate, ref) =>
		candidate.folder !== null && matchesFolder(candidate.folder, ref, 0),
	(candidate, ref) =>
		candidate.folder !== null && matchesFolder(candidate.folder, ref, 1),
];

/**
 * Relie chaque média du backlog à un film ou une série du relevé, chacun au plus une fois : même identifiant, sinon un
 * outil qui donne cet identifiant, sinon le dossier « Titre (année) » (§4). Le job, qui ne lit pas la base, ne sait pas
 * lequel des identifiants des outils est le bon : un fichier que Radarr range sous un autre film reste ainsi celui de
 * ce média (écart « Fiche différente »), au lieu de le laisser absent du NAS et l'autre oublié. Rend, pour chaque
 * identifiant du backlog relié, la position de son média dans `candidates`
 */
export function claimSurveyedMedia(
	candidates: SurveyedCandidate[],
	refs: BacklogMediaRef[],
): Map<number, number> {
	const claims = new Map<number, number>();
	const claimed = new Set<number>();
	for (const rule of RULES)
		for (const ref of refs) {
			if (claims.has(ref.tmdbId)) continue;
			const position = candidates.findIndex(
				(candidate, index) => !claimed.has(index) && rule(candidate, ref),
			);
			if (position === -1) continue;
			claims.set(ref.tmdbId, position);
			claimed.add(position);
		}
	return claims;
}
