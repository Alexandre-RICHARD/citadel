// Compte chaque nom exporté : "export const a = 1, b = 2" et "export { a, b }" valent 2
function countExports(statement) {
	switch (statement.type) {
		case "ExportDefaultDeclaration":
		case "ExportAllDeclaration":
		case "TSExportAssignment":
			return 1;
		case "ExportNamedDeclaration":
			if (statement.declaration?.type === "VariableDeclaration")
				return statement.declaration.declarations.length;
			return statement.declaration ? 1 : statement.specifiers.length;
		default:
			return 0;
	}
}

export const maxOneExport = {
	meta: {
		type: "suggestion",
		docs: { description: "Un seul export par fichier" },
		schema: [],
		messages: {
			tooManyExports:
				"Un seul export par fichier : déplace cet export dans son propre fichier",
		},
	},
	create(context) {
		return {
			Program(program) {
				let exportCount = 0;
				// Seuls les exports de premier niveau comptent (pas ceux d'un "declare module")
				for (const statement of program.body) {
					const statementExportCount = countExports(statement);
					if (statementExportCount === 0) continue;
					if (exportCount + statementExportCount > 1)
						context.report({ node: statement, messageId: "tooManyExports" });
					exportCount += statementExportCount;
				}
			},
		};
	},
};
