// Règles de comparaison des titres, des noms de dossiers et des fichiers vidéo.

// « L'Âge de glace : la dérive » et « l age de glace la derive » se comparent égaux
export function normalizeTitle(title) {
	return String(title ?? "")
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^\p{L}\p{N}]+/gu, " ")
		.trim();
}

export function yearOf(value) {
	if (value instanceof Date) return value.getUTCFullYear();
	const match = String(value ?? "").match(/\b(18|19|20)\d{2}\b/);
	return match ? Number(match[0]) : undefined;
}

// Nom de dossier de movies_archives : « Titre (année) »
export function parseTitleYearFolder(name) {
	const match = name.match(/^(.*?)\s*\((\d{4})\)/);
	return match ? { title: match[1], year: Number(match[2]) } : { title: name, year: undefined };
}

// « S01E02 », « s1e2 » ou « 1x02 » dans un nom de fichier
export function parseEpisodeNumbers(fileName) {
	const match = fileName.match(/s(\d{1,2})[ ._-]?e(\d{1,3})/i) ?? fileName.match(/\b(\d{1,2})x(\d{2,3})\b/i);
	return match ? { season: Number(match[1]), episode: Number(match[2]) } : undefined;
}

const videoExtensions = new Set(["mkv", "mp4", "avi", "m4v", "mov", "wmv", "ts", "m2ts", "mpg", "mpeg", "webm", "iso"]);

export function isVideoFile(filePath) {
	return videoExtensions.has(filePath.split(".").pop()?.toLowerCase());
}

// « 1:52:03 » ou « 52:03 » (format de Radarr et Sonarr), en minutes
export function parseRunTimeMinutes(runTime) {
	if (!runTime) return undefined;
	const parts = String(runTime).split(":").map(Number);
	if (parts.some((part) => !Number.isFinite(part))) return undefined;
	const [hours, minutes, seconds] = parts.length === 3 ? parts : [0, ...parts];
	return hours * 60 + minutes + seconds / 60;
}

const qualities = ["SD", "HD", "FHD", "4K"];

// La meilleure des deux mesures (§5) : 1920 × 800 (format large, bandes noires coupées) est FHD, 1440 × 1080 (4:3) aussi
export function qualityFromResolution(resolution) {
	const match = String(resolution ?? "").match(/(\d+)\s*x\s*(\d+)/);
	if (!match) return { quality: undefined, width: undefined, height: undefined };
	const width = Number(match[1]);
	const height = Number(match[2]);
	return { quality: betterQuality(qualityFromHeight(height), qualityFromWidth(width)), width, height };
}

function betterQuality(first, second) {
	return qualities.indexOf(first) >= qualities.indexOf(second) ? first : second;
}

// Tout est ramené au code ISO 639-1 de TMDB (« fr ») : Radarr et Sonarr nomment les langues (« French / English »),
// Jellyfin donne des codes ISO 639-2 (« fre », « eng »)
const languageCodes = {
	french: "fr", fre: "fr", fra: "fr",
	english: "en", eng: "en",
	japanese: "ja", jpn: "ja",
	korean: "ko", kor: "ko",
	spanish: "es", spa: "es",
	german: "de", ger: "de", deu: "de",
	italian: "it", ita: "it",
	chinese: "zh", chi: "zh", zho: "zh", mandarin: "zh", cantonese: "zh", cn: "zh",
	portuguese: "pt", por: "pt",
	russian: "ru", rus: "ru",
	dutch: "nl", dut: "nl", nld: "nl",
	swedish: "sv", swe: "sv",
	danish: "da", dan: "da",
	norwegian: "no", nor: "no",
	finnish: "fi", fin: "fi",
	polish: "pl", pol: "pl",
	turkish: "tr", tur: "tr",
	hindi: "hi", hin: "hi",
	thai: "th", tha: "th",
	arabic: "ar", ara: "ar",
	hebrew: "he", heb: "he",
	czech: "cs", cze: "cs", ces: "cs",
	greek: "el", gre: "el", ell: "el",
	icelandic: "is", ice: "is", isl: "is",
};

export function languageCodesOf(values) {
	const names = values.flatMap((value) => String(value ?? "").split("/")).map((name) => name.trim().toLowerCase()).filter(Boolean);
	return [...new Set(names.map((name) => languageCodes[name] ?? name))];
}

// VF, VO, STFR, STVO (§5) ; quand la langue originale est le français, VO et STVO n'apportent rien
export function languageTags(audio, subtitles, originalLanguage) {
	const original = languageCodes[originalLanguage] ?? originalLanguage;
	const originalIsFrench = original === "fr";
	return [
		audio.includes("fr") ? "VF" : undefined,
		!originalIsFrench && original && audio.includes(original) ? "VO" : undefined,
		subtitles.includes("fr") ? "STFR" : undefined,
		!originalIsFrench && original && subtitles.includes(original) ? "STVO" : undefined,
	].filter(Boolean);
}

function qualityFromHeight(height) {
	if (height >= 2160) return "4K";
	if (height >= 1080) return "FHD";
	if (height >= 720) return "HD";
	return "SD";
}

function qualityFromWidth(width) {
	if (width >= 3840) return "4K";
	if (width >= 1920) return "FHD";
	if (width >= 1280) return "HD";
	return "SD";
}

export function gigabytes(bytes) {
	return bytes === undefined ? undefined : round(bytes / 1024 ** 3, 2);
}

export function round(value, digits = 1) {
	if (value === undefined || !Number.isFinite(value)) return undefined;
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
}

export function join(values, separator = " | ") {
	const kept = [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))];
	return kept.length ? kept.join(separator) : undefined;
}
