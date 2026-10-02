import path from "node:path";

import { getSingleExport } from "./utils/getSingleExport.js";

export const tsxNameMatchesExport = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Un .tsx porte le nom de ce qu'il exporte, un index.tsx exporte le nom de son dossier avec une majuscule",
		},
		schema: [],
		messages: {
			fileName:
				"{{fileName}}.tsx doit porter le nom de ce qu'il exporte : renomme le fichier en {{exportName}}.tsx, ou l'export en {{fileName}}",
			indexName:
				"Un index.tsx exporte le nom de son dossier avec une majuscule : {{expectedName}} attendu, {{exportName}} trouvé",
		},
	},
	create(context) {
		return {
			Program(program) {
				const exported = getSingleExport(program);
				if (!exported) return;

				const fileName = path.basename(context.filename).split(".")[0];
				const folderName = path.basename(path.dirname(context.filename));
				const isIndex = fileName === "index";
				// Majuscule forcée
				const expectedName = isIndex
					? folderName[0].toUpperCase() + folderName.slice(1)
					: fileName;
				if (exported.name === expectedName) return;

				context.report({
					node: exported.node,
					messageId: isIndex ? "indexName" : "fileName",
					data: { fileName, expectedName, exportName: exported.name },
				});
			},
		};
	},
};
