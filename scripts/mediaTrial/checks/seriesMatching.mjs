// Vérification 2 : le rapprochement des séries de la liste (sans identifiant) avec TMDB, par titre et année.
// « sûr » : un seul candidat au titre et à l'année identiques, ou celui que Sonarr connaît sous ce titre ;
// « douteux » : tout le reste, à valider à la main dans l'aperçu de l'import ; « aucun » : TMDB ne trouve rien.
import { join, normalizeTitle, yearOf } from "../lib/text.mjs";

function titleMatches(candidate, title) {
	const wanted = normalizeTitle(title);
	return normalizeTitle(candidate.name) === wanted || normalizeTitle(candidate.original_name) === wanted;
}

async function searchCandidates(tmdb, title, year) {
	const withYear = year ? (await tmdb.searchTv(title, year)).results : [];
	return withYear.length ? withYear : (await tmdb.searchTv(title)).results;
}

function describeCandidate(candidate) {
	return candidate ? `${candidate.id} · ${candidate.name} (${candidate.first_air_date?.slice(0, 4) ?? "?"})` : undefined;
}

export function chooseSeries(item, candidates, sonarrTmdbId) {
	const exact = candidates.filter((candidate) => titleMatches(candidate, item.title) && yearOf(candidate.first_air_date) === item.year);
	const sonarrCandidate = sonarrTmdbId && candidates.find((candidate) => candidate.id === sonarrTmdbId);
	if (sonarrCandidate) return { chosen: sonarrCandidate, status: "sûr", reason: "celui de Sonarr" };
	if (exact.length === 1) return { chosen: exact[0], status: sonarrTmdbId ? "douteux" : "sûr", reason: sonarrTmdbId ? `Sonarr en connaît un autre : ${sonarrTmdbId}` : "titre et année identiques" };
	if (!candidates.length) return { chosen: undefined, status: "aucun", reason: "TMDB ne trouve rien" };
	const reason = exact.length > 1 ? `${exact.length} candidats au même titre et à la même année` : "pas de titre et d'année identiques";
	return { chosen: exact[0] ?? candidates[0], status: "douteux", reason };
}

export async function runSeriesMatching({ tmdb, report, series, sonarrSeries }) {
	const sonarrByTitle = new Map((sonarrSeries ?? []).map((item) => [normalizeTitle(item.title), item.tmdbId || undefined]));
	const matches = await report.time(
		"2. TMDB : rapprochement des séries de la liste",
		() =>
			tmdb.mapAll(series, async (item) => {
				const candidates = await searchCandidates(tmdb, item.title, item.year);
				return { item, candidates, ...chooseSeries(item, candidates, sonarrByTitle.get(normalizeTitle(item.title))) };
			}),
		(results) => `${results.length} séries`,
	);

	report.addSheet(
		"2 Séries",
		[
			{ key: "row", header: "Ligne" },
			{ key: "title", header: "Titre (liste)", width: 30 },
			{ key: "year", header: "Année (liste)" },
			{ key: "status", header: "Rapprochement" },
			{ key: "reason", header: "Raison", width: 40 },
			{ key: "tmdbId", header: "TMDB retenu" },
			{ key: "name", header: "Titre TMDB", width: 30 },
			{ key: "originalName", header: "Titre original", width: 30 },
			{ key: "firstAirDate", header: "1re diffusion" },
			{ key: "sonarr", header: "Sonarr (TMDB)" },
			{ key: "others", header: "Autres candidats", width: 60 },
		],
		matches.map(({ item, candidates, chosen, status, reason }) => ({
			row: item.rowNumber,
			title: item.title,
			year: item.year,
			status,
			reason,
			tmdbId: chosen?.id,
			name: chosen?.name,
			originalName: chosen?.original_name,
			firstAirDate: chosen?.first_air_date,
			sonarr: sonarrByTitle.get(normalizeTitle(item.title)),
			others: join(candidates.filter((candidate) => candidate !== chosen).slice(0, 3).map(describeCandidate)),
		})),
	);

	return matches;
}
