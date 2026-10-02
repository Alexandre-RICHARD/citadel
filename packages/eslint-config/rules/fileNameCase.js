import path from "node:path";

import { getSingleExport } from "./utils/getSingleExport.js";

const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;
const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;

export const fileNameCase = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Un .ts est en camelCase, ou en PascalCase s'il exporte une classe",
		},
		schema: [],
		messages: {
			notCamelCase:
				"{{fileName}} doit être en camelCase (le PascalCase est réservé aux fichiers qui exportent une classe)",
		},
	},
	create(context) {
		return {
			Program(program) {
				// Les suffixes ne comptent pas : buttonVariant.enum.ts est jugé sur "buttonVariant"
				const fileName = path.basename(context.filename).split(".")[0];
				if (CAMEL_CASE.test(fileName)) return;
				if (
					PASCAL_CASE.test(fileName) &&
					getSingleExport(program)?.kind === "class"
				)
					return;

				context.report({
					loc: { line: 1, column: 0 },
					messageId: "notCamelCase",
					data: { fileName },
				});
			},
		};
	},
};
