import { existsSync } from "node:fs";
import path from "node:path";

const TEST_FUNCTIONS = new Set(["it", "test"]);
const UNIT_TEST_SUFFIX = /\.unit\.test\.tsx?$/;
const INTEGRATION_TEST_SUFFIX = /\.integration\.test\.ts$/;

// Nom de la fonction de test, que l'appel soit direct (it), modifié (it.skip) ou paramétré (it.each([...]))
function getTestFunctionName(callExpression) {
	let callee = callExpression.callee;
	if (callee.type === "CallExpression") callee = callee.callee;
	if (callee.type === "MemberExpression") callee = callee.object;
	return callee.type === "Identifier" ? callee.name : null;
}

// Titre statique : les ${...} d'un template literal sont gardés tels quels
function getTitle(callExpression) {
	const [titleNode] = callExpression.arguments;
	if (titleNode?.type === "Literal" && typeof titleNode.value === "string")
		return titleNode.value;
	if (titleNode?.type === "TemplateLiteral")
		return titleNode.quasis.map((quasi) => quasi.value.cooked).join("${}");
	return null;
}

/**
 * Premier describe attendu : le fichier testé, voisin du test unitaire (foo.ts ou foo.tsx),
 * ou l'endpoint pour un test d'intégration (createGame pour createGame.integration.test.ts)
 */
function getExpectedFileTitle(filename) {
	const baseName = path.basename(filename);
	if (INTEGRATION_TEST_SUFFIX.test(baseName))
		return baseName.replace(INTEGRATION_TEST_SUFFIX, "");

	const testedName = baseName.replace(UNIT_TEST_SUFFIX, "");
	const directory = path.dirname(filename);
	const testedFile = [".ts", ".tsx"]
		.map((extension) => `${testedName}${extension}`)
		.find((candidate) => existsSync(path.join(directory, candidate)));
	return testedFile ?? `${testedName}.ts`;
}

export const testStructure = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"describe du fichier testé > describe du comportement > it « SHOULD … WHEN … »",
		},
		schema: [],
		messages: {
			fileDescribe:
				'Le premier describe porte le nom du fichier testé : "{{expected}}"',
			tooDeep:
				"Deux niveaux de describe au plus : le fichier testé, puis le comportement",
			wrongDepth:
				"Un it doit être dans deux describe : le fichier testé, puis le comportement",
			shouldTitle:
				'Le titre d\'un it commence par "SHOULD " (puis "WHEN …" si besoin)',
		},
	},
	create(context) {
		const expectedFileTitle = getExpectedFileTitle(context.filename);
		let describeDepth = 0;

		return {
			"CallExpression"(node) {
				const name = getTestFunctionName(node);

				if (name === "describe") {
					const title = getTitle(node);
					if (
						describeDepth === 0 &&
						title !== null &&
						title !== expectedFileTitle
					)
						context.report({
							node: node.arguments[0],
							messageId: "fileDescribe",
							data: { expected: expectedFileTitle },
						});
					if (describeDepth >= 2)
						context.report({ node, messageId: "tooDeep" });
					describeDepth += 1;
					return;
				}

				if (!TEST_FUNCTIONS.has(name ?? "")) return;
				if (describeDepth !== 2)
					context.report({ node, messageId: "wrongDepth" });
				const title = getTitle(node);
				if (title !== null && !title.startsWith("SHOULD "))
					context.report({ node: node.arguments[0], messageId: "shouldTitle" });
			},
			"CallExpression:exit"(node) {
				if (getTestFunctionName(node) === "describe") describeDepth -= 1;
			},
		};
	},
};
