import path from "node:path";

import { getSingleExport } from "./utils/getSingleExport.js";

const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;
const COMPONENT_KINDS = new Set(["function", "variable", "reference", "class"]);

export const componentFolderCase = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Un dossier qui contient directement un composant React est en PascalCase",
		},
		schema: [],
		messages: {
			folderNotPascalCase:
				"Le dossier {{folderName}} contient directement un composant ({{componentName}}) : il doit être en PascalCase",
		},
	},
	create(context) {
		return {
			Program(program) {
				const exported = getSingleExport(program);
				const isComponent =
					exported &&
					COMPONENT_KINDS.has(exported.kind) &&
					PASCAL_CASE.test(exported.name);
				if (!isComponent) return;

				const folderName = path.basename(path.dirname(context.filename));
				if (PASCAL_CASE.test(folderName)) return;

				context.report({
					node: exported.node,
					messageId: "folderNotPascalCase",
					data: { folderName, componentName: exported.name },
				});
			},
		};
	},
};
