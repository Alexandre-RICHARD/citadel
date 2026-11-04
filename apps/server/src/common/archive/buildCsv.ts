import type { CsvCell } from "./csvCell.type.ts";

// Un tableur exécute une cellule qui commence par l'un de ces caractères comme une formule : un pseudo affiché ou un user
// agent hostile ne doit pas s'ouvrir ainsi
const FORMULA_STARTS = new Set(["=", "+", "-", "@", "\t", "\r"]);

// Le BOM fait lire le fichier en UTF-8 par Excel, sinon les accents s'affichent mal
const UTF8_BOM = "﻿";

function formatCell(cell: CsvCell): string {
	if (cell === null || cell === undefined) return "";
	if (cell instanceof Date) return cell.toISOString();
	if (typeof cell !== "string") return String(cell);

	const safe = FORMULA_STARTS.has(cell.charAt(0)) ? `'${cell}` : cell;
	return /["\n\r,;]/u.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

/**
 * Un fichier CSV (RFC 4180 : virgules, lignes terminées par CRLF, guillemets doublés), en UTF-8 avec BOM. Les dates
 * sont en ISO 8601, un vide pour null
 */
export function buildCsv(
	headers: readonly string[],
	rows: readonly (readonly CsvCell[])[],
): string {
	const lines = [headers, ...rows].map((line) =>
		line.map((cell) => formatCell(cell)).join(","),
	);
	return `${UTF8_BOM}${lines.join("\r\n")}\r\n`;
}
