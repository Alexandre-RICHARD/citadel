// Le rapport Excel : une feuille par vérification, en-tête figé et filtres posés sur chaque colonne.
import ExcelJS from "exceljs";

function writeSheet(workbook, { name, columns, rows }) {
	const sheet = workbook.addWorksheet(name.slice(0, 31), { views: [{ state: "frozen", ySplit: 1 }] });
	sheet.columns = columns.map(({ key, header, width }) => ({ key, header, width: width ?? Math.max(10, header.length + 2) }));
	sheet.getRow(1).font = { bold: true };
	for (const row of rows) sheet.addRow(row);
	if (columns.length) sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
}

export function createReport() {
	const sheets = [];
	const timings = [];

	return {
		// columns : [{ key, header, width? }] ; rows : objets dont les clés sont celles des colonnes
		addSheet(name, columns, rows) {
			sheets.push({ name, columns, rows });
			console.log(`  feuille « ${name} » : ${rows.length} lignes`);
		},

		// Chronomètre une étape et la note pour la feuille des temps (vérification 5)
		async time(step, action, describe = () => undefined) {
			const start = performance.now();
			console.log(`… ${step}`);
			const result = await action();
			const seconds = (performance.now() - start) / 1000;
			timings.push({ step, seconds: Math.round(seconds * 10) / 10, detail: describe(result) });
			return result;
		},

		async write(file) {
			this.addSheet(
				"5 Temps",
				[
					{ key: "step", header: "Étape", width: 50 },
					{ key: "seconds", header: "Durée (s)" },
					{ key: "detail", header: "Détail", width: 50 },
				],
				timings,
			);
			// Les feuilles sont rangées par leur numéro de vérification, pas par leur ordre de calcul
			const workbook = new ExcelJS.Workbook();
			const checkNumber = (sheet) => Number.parseInt(sheet.name, 10);
			for (const sheet of [...sheets].sort((first, second) => checkNumber(first) - checkNumber(second))) writeSheet(workbook, sheet);
			await workbook.xlsx.writeFile(file);
		},
	};
}
