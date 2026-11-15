// Les deux listes données au script : la liste courte (texte) et l'export Excel de « NAS Multimédia ».
// Les colonnes de l'export sont reconnues par leur titre, où qu'elles soient : le rapport dit lesquelles ont été prises.
import fs from "node:fs";
import ExcelJS from "exceljs";
import { normalizeTitle, yearOf } from "./text.mjs";

// Une ligne par média : « film 603 » ou « série 1399 », « # » pour un commentaire
export function readShortList(file) {
	return fs
		.readFileSync(file, "utf8")
		.split(/\r?\n/)
		.map((line) => line.replace(/#.*/, "").trim())
		.filter(Boolean)
		.map((line) => {
			const [kind, id] = line.split(/\s+/);
			const type = /^(film|movie)$/i.test(kind) ? "movie" : /^(s[ée]rie|tv)$/i.test(kind) ? "tv" : undefined;
			if (!type || !/^\d+$/.test(id ?? "")) throw new Error(`Liste courte : ligne illisible « ${line} » (attendu : film 603 ou série 1399)`);
			return { type, id: Number(id) };
		});
}

const columnMatchers = {
	tmdb: (header) => header.includes("tmdb") && !header.includes("collection"),
	imdb: (header) => header.includes("imdb"),
	group: (header) => header.startsWith("groupe") || header.startsWith("saga"),
	collection: (header) => header.includes("collec"),
	state: (header) => header === "etat" || header.startsWith("etat "),
	title: (header) => header.startsWith("titre") || header.startsWith("nom") || header === "title",
	year: (header) => header.startsWith("annee") || header === "year" || header.startsWith("sortie"),
};

// Une cellule Excel peut être un lien, une formule ou du texte enrichi : on n'en garde que la valeur
function cellText(value) {
	if (value === null || value === undefined) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === "object") {
		if ("result" in value) return cellText(value.result);
		if ("text" in value) return cellText(value.text);
		if ("richText" in value) return value.richText.map((part) => part.text).join("");
		if ("hyperlink" in value) return value.hyperlink;
	}
	return typeof value === "string" ? value.trim() || undefined : value;
}

// Un identifiant peut être écrit seul ou dans une adresse (themoviedb.org/movie/603-matrix)
function numericId(value) {
	const match = String(cellText(value) ?? "").match(/(\d+)/);
	return match ? Number(match[1]) : undefined;
}

function findHeaderRow(sheet, requiredColumn) {
	for (let rowNumber = 1; rowNumber <= Math.min(10, sheet.rowCount); rowNumber++) {
		const columns = {};
		const headers = [];
		sheet.getRow(rowNumber).eachCell((cell, columnNumber) => {
			const header = normalizeTitle(cellText(cell.value));
			headers.push(String(cellText(cell.value)));
			for (const [name, matches] of Object.entries(columnMatchers)) {
				if (columns[name] === undefined && header && matches(header)) columns[name] = { columnNumber, header: cellText(cell.value) };
			}
		});
		if (columns[requiredColumn]) return { rowNumber, columns, headers };
	}
	return undefined;
}

function readRows(sheet, header) {
	const rows = [];
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber <= header.rowNumber) return;
		const read = (name) => (header.columns[name] ? row.getCell(header.columns[name].columnNumber).value : undefined);
		rows.push({ rowNumber, read });
	});
	return rows;
}

function describeColumns(sheetName, header) {
	return Object.entries(header.columns).map(([name, { header: title, columnNumber }]) => ({ sheet: sheetName, name, title, columnNumber }));
}

export async function readMediaList(file) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(file);
	const seriesSheet = workbook.worksheets.find((sheet) => /s[ée]ries/i.test(sheet.name));
	const moviesSheet = workbook.worksheets.find((sheet) => sheet !== seriesSheet && findHeaderRow(sheet, "tmdb"));
	if (!moviesSheet) {
		const names = workbook.worksheets.map((sheet) => sheet.name).join(", ");
		throw new Error(`Export : aucune feuille avec une colonne « TMDB » parmi : ${names}`);
	}

	const movieHeader = findHeaderRow(moviesSheet, "tmdb");
	const movies = readRows(moviesSheet, movieHeader)
		.map(({ rowNumber, read }) => ({
			rowNumber,
			tmdbId: numericId(read("tmdb")),
			imdbId: cellText(read("imdb")),
			title: cellText(read("title")),
			group: cellText(read("group")),
			collectionId: numericId(read("collection")),
			state: cellText(read("state")),
		}))
		.filter((movie) => movie.tmdbId || movie.title);

	const seriesHeader = seriesSheet && findHeaderRow(seriesSheet, "title");
	if (seriesSheet && !seriesHeader) throw new Error(`Feuille « ${seriesSheet.name} » : aucune colonne de titre`);
	const series = seriesHeader
		? readRows(seriesSheet, seriesHeader)
				.map(({ rowNumber, read }) => ({ rowNumber, title: cellText(read("title")), year: yearOf(cellText(read("year"))), state: cellText(read("state")) }))
				.filter((item) => item.title)
		: [];

	const columns = [
		...describeColumns(moviesSheet.name, movieHeader),
		...(seriesHeader ? describeColumns(seriesSheet.name, seriesHeader) : []),
	];
	return { movies, series, columns, seriesSheetName: seriesSheet?.name };
}
