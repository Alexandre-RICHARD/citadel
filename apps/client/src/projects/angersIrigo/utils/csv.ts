/**
 * Parse un CSV avec ligne d'en-tête en objets indexés par nom de colonne.
 * Gère ce que la spec GTFS autorise : champs entre guillemets (pouvant contenir
 * virgules et sauts de ligne), guillemets doublés (`""`), fins de ligne CRLF et BOM.
 */
export function parseCsv(text: string): Record<string, string>[] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;

	const BYTE_ORDER_MARK = 0xfeff;
	const content = text.charCodeAt(0) === BYTE_ORDER_MARK ? text.slice(1) : text;
	for (let i = 0; i < content.length; i++) {
		const char = content[i];

		if (inQuotes) {
			const isEscapedQuote = char === '"' && content[i + 1] === '"';
			if (isEscapedQuote) {
				field += '"';
				i++;
			} else if (char === '"') {
				inQuotes = false;
			} else {
				field += char;
			}
		} else if (char === '"') {
			inQuotes = true;
		} else if (char === ",") {
			row.push(field);
			field = "";
		} else if (char === "\n") {
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else if (char !== "\r") {
			field += char;
		}
	}
	// Dernière ligne sans saut de ligne final
	if (field !== "" || row.length > 0) {
		row.push(field);
		rows.push(row);
	}

	const [header = [], ...records] = rows;
	return records.map((values) =>
		Object.fromEntries(
			header.map((column, index) => [column, values[index] ?? ""]),
		),
	);
}
