import { normalizeText } from "@citadel/common/src/universal/string/normalizeText";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

import type { MediaImportCsv } from "./mediaImportCsv.type";

// Le type d'une ligne, sans accents ni majuscules : en français ou en anglais
const MEDIA_TYPES: Readonly<Record<string, MediaTypeEnum>> = {
	film: MediaTypeEnum.MOVIE,
	movie: MediaTypeEnum.MOVIE,
	serie: MediaTypeEnum.SHOW,
	series: MediaTypeEnum.SHOW,
	show: MediaTypeEnum.SHOW,
	tv: MediaTypeEnum.SHOW,
};

// Virgule, point-virgule (Excel en français) ou tabulation
const SEPARATOR = /[,;\t]/;

// Une ligne : l'identifiant TMDB et le type, dans un ordre ou dans l'autre, entre guillemets ou non
function parseLine(line: string): MediaImportCsv["entries"][number] | null {
	const cells = line.split(SEPARATOR).map((cell) =>
		cell
			.trim()
			.replace(/^"(.*)"$/, "$1")
			.trim(),
	);
	if (cells.length !== 2) return null;
	const idCell = cells.find((cell) => /^\d+$/.test(cell));
	const typeCell = cells.find((cell) => cell !== idCell);
	const mediaType =
		typeCell === undefined ? undefined : MEDIA_TYPES[normalizeText(typeCell)];
	const tmdbId = Number(idCell);
	if (mediaType === undefined || !Number.isSafeInteger(tmdbId) || tmdbId < 1)
		return null;
	return { mediaType, tmdbId };
}

/**
 * Le fichier CSV de l'import (§7.2) : deux colonnes, l'identifiant TMDB et le type (film ou série). Les lignes vides sont
 * ignorées ; une première ligne illisible est un en-tête. Les autres lignes illisibles sont rendues, par numéro, pour que
 * le fichier se corrige avant l'envoi
 */
export function parseMediaImportCsv(text: string): MediaImportCsv {
	const entries: MediaImportCsv["entries"] = [];
	const invalidLines: MediaImportCsv["invalidLines"] = [];
	const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
	for (const [index, line] of lines.entries()) {
		if (line.trim() === "") continue;
		const entry = parseLine(line);
		if (entry !== null) entries.push(entry);
		else if (index > 0 || entries.length > 0)
			invalidLines.push({ lineNumber: index + 1, text: line.trim() });
	}
	return { entries, invalidLines };
}
