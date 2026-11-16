// Tout est ramené au code ISO 639-1 de TMDB (« fr ») : Radarr et Sonarr nomment les langues (« French »), Jellyfin donne
// des codes ISO 639-2 (« fre », « eng »). Une langue inconnue de cette table, ou « und », n'est pas gardée
const LANGUAGE_CODES: Record<string, string> = {
	french: "fr",
	fre: "fr",
	fra: "fr",
	fr: "fr",
	english: "en",
	eng: "en",
	en: "en",
	japanese: "ja",
	jpn: "ja",
	ja: "ja",
	korean: "ko",
	kor: "ko",
	ko: "ko",
	spanish: "es",
	spa: "es",
	es: "es",
	german: "de",
	ger: "de",
	deu: "de",
	de: "de",
	italian: "it",
	ita: "it",
	it: "it",
	chinese: "zh",
	chi: "zh",
	zho: "zh",
	mandarin: "zh",
	cantonese: "zh",
	zh: "zh",
	portuguese: "pt",
	por: "pt",
	pt: "pt",
	russian: "ru",
	rus: "ru",
	ru: "ru",
	dutch: "nl",
	dut: "nl",
	nld: "nl",
	nl: "nl",
	swedish: "sv",
	swe: "sv",
	sv: "sv",
	danish: "da",
	dan: "da",
	da: "da",
	norwegian: "no",
	nor: "no",
	no: "no",
	finnish: "fi",
	fin: "fi",
	fi: "fi",
	polish: "pl",
	pol: "pl",
	pl: "pl",
	turkish: "tr",
	tur: "tr",
	tr: "tr",
	hindi: "hi",
	hin: "hi",
	hi: "hi",
	thai: "th",
	tha: "th",
	th: "th",
	arabic: "ar",
	ara: "ar",
	ar: "ar",
	hebrew: "he",
	heb: "he",
	he: "he",
	czech: "cs",
	cze: "cs",
	ces: "cs",
	cs: "cs",
	greek: "el",
	gre: "el",
	ell: "el",
	el: "el",
	icelandic: "is",
	ice: "is",
	isl: "is",
	is: "is",
};

/**
 * Les langues d'un fichier, en codes ISO 639-1, sans doublon. Chaque valeur peut en porter plusieurs, séparées par
 * « / » (« French/English », format de Radarr et Sonarr)
 */
export function toLanguageCodes(
	values: readonly (string | null | undefined)[],
): string[] {
	const names = values
		.flatMap((value) => (value ?? "").split("/"))
		.map((name) => name.trim().toLowerCase())
		.filter((name) => name !== "");
	return [
		...new Set(
			names.flatMap((name) => {
				const code = LANGUAGE_CODES[name];
				return code === undefined ? [] : [code];
			}),
		),
	];
}
