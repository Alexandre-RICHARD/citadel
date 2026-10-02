const DECLARATION_KINDS = {
	FunctionDeclaration: "function",
	ClassDeclaration: "class",
	TSTypeAliasDeclaration: "type",
	TSInterfaceDeclaration: "interface",
	TSEnumDeclaration: "enum",
};

function describeDeclaration(declaration) {
	if (declaration.type === "VariableDeclaration") {
		const [declarator] = declaration.declarations;
		return declarator?.id.type === "Identifier"
			? { name: declarator.id.name, kind: "variable" }
			: null;
	}
	const kind = DECLARATION_KINDS[declaration.type];
	return kind && declaration.id ? { name: declaration.id.name, kind } : null;
}

// Nom et nature du premier export du fichier (le reste est le travail de max-one-export)
export function getSingleExport(program) {
	for (const statement of program.body) {
		if (statement.type === "ExportDefaultDeclaration") {
			const { declaration } = statement;
			if (declaration.type === "Identifier")
				return { name: declaration.name, kind: "reference", node: statement };
			const described = describeDeclaration(declaration);
			return described ? { ...described, node: statement } : null;
		}
		if (statement.type !== "ExportNamedDeclaration") continue;
		if (statement.declaration) {
			const described = describeDeclaration(statement.declaration);
			return described ? { ...described, node: statement } : null;
		}
		const [specifier] = statement.specifiers;
		if (specifier)
			return {
				name: specifier.exported.name,
				kind: "reference",
				node: statement,
			};
	}
	return null;
}
