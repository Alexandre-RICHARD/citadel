/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { StopGroup } from "../types/stop";

/** Minuscules sans accents ni ponctuation : « Foch-Maison Bleue » → « foch maison bleue » */
export function normalizeForSearch(text: string): string {
	return text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

type IndexedStop = {
	stop: StopGroup;
	name: string;
	words: string[];
};

/*
 * Pertinence d'un résultat, de la meilleure à la moins bonne :
 * - le nom commence par la recherche : « foch » → « Foch-Maison Bleue »
 * - chaque mot tapé commence un mot du nom : « bleue » → « Foch-Maison Bleue »
 * - chaque mot tapé figure dans le nom : « eue » → « Foch-Maison Bleue »
 */
const NAME_PREFIX_RANK = 0;
const WORD_PREFIX_RANK = 1;
const SUBSTRING_RANK = 2;

/**
 * Prépare la recherche dans les arrêts (noms normalisés une fois pour toutes). La fonction renvoyée
 * donne les arrêts dont le nom contient chaque mot tapé, sans tenir compte des accents ni de la
 * ponctuation, les plus pertinents d'abord, puis par ordre alphabétique.
 */
export function createStopSearch(
	stops: StopGroup[],
): (query: string, limit: number) => StopGroup[] {
	const index: IndexedStop[] = stops.map((stop) => {
		const name = normalizeForSearch(stop.name);
		return { stop, name, words: name.split(" ") };
	});

	return (query, limit) => {
		const normalizedQuery = normalizeForSearch(query);
		if (!normalizedQuery) {
			return [];
		}
		const queryWords = normalizedQuery.split(" ");

		const matches: { stop: StopGroup; rank: number }[] = [];
		for (const { stop, name, words } of index) {
			if (!queryWords.every((queryWord) => name.includes(queryWord))) {
				continue;
			}
			const rank = name.startsWith(normalizedQuery)
				? NAME_PREFIX_RANK
				: queryWords.every((queryWord) =>
							words.some((word) => word.startsWith(queryWord)),
					  )
					? WORD_PREFIX_RANK
					: SUBSTRING_RANK;
			matches.push({ stop, rank });
		}

		return matches
			.sort(
				(a, b) =>
					a.rank - b.rank || a.stop.name.localeCompare(b.stop.name, "fr"),
			)
			.slice(0, limit)
			.map(({ stop }) => stop);
	};
}
