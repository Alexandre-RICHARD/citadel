import type { WatchedPlan } from "./watchedPlan.type";

/**
 * Les mots du dialogue d'une case « Vu » qui touche plusieurs épisodes : la question, et le bouton qui l'accepte.
 * `subject` : ce que nomme la case (« la série », « Saison 2 », « l'épisode 3 »)
 */
export function describeWatchedPlan(
	plan: Exclude<WatchedPlan, { kind: "direct" }>,
	subject: string,
): { question: string; confirmLabel: string } {
	const { isWatched } = plan.change;
	const verb = isWatched ? "Cocher" : "Décocher";
	if (plan.kind === "cascade") {
		const count = plan.change.episodeIds.length;
		const place = subject === "la série" ? "toute la série" : `« ${subject} »`;
		return {
			question: isWatched
				? `Les ${count} épisodes diffusés pas encore vus de ${place} passent à vu.`
				: `Les ${count} épisodes vus de ${place} repassent à pas vu.`,
			confirmLabel: `${verb} les ${count} épisodes`,
		};
	}
	const extraCount =
		plan.extended.episodeIds.length - plan.change.episodeIds.length;
	const others = isWatched ? "précédent" : "suivant";
	if (extraCount === 1)
		return {
			question: isWatched
				? `L’épisode précédent n’est pas encore vu. Le cocher aussi ?`
				: `L’épisode suivant est vu. Le décocher aussi ?`,
			confirmLabel: `${verb} aussi le ${others}`,
		};
	return {
		question: isWatched
			? `${extraCount} épisodes précédents ne sont pas encore vus. Les cocher aussi ?`
			: `${extraCount} épisodes suivants sont vus. Les décocher aussi ?`,
		confirmLabel: `${verb} aussi les ${extraCount} ${others}s`,
	};
}
