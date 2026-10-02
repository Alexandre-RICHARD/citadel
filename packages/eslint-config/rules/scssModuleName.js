import path from "node:path";

// Seul un .module.scss du même dossier est concerné : un module partagé importé via ../ reste libre
const LOCAL_SCSS_MODULE = /^\.\/([^/]+)\.module\.scss$/;

export const scssModuleName = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Le .module.scss d'un dossier porte le nom du dossier en camelCase",
		},
		schema: [],
		messages: {
			wrongName:
				"Le .module.scss de ce dossier doit s'appeler ./{{expectedName}}.module.scss",
		},
	},
	create(context) {
		const folderName = path.basename(path.dirname(context.filename));
		const expectedName = folderName[0].toLowerCase() + folderName.slice(1);

		return {
			ImportDeclaration(node) {
				const match = LOCAL_SCSS_MODULE.exec(node.source.value);
				if (!match || match[1] === expectedName) return;

				context.report({
					node: node.source,
					messageId: "wrongName",
					data: { expectedName },
				});
			},
		};
	},
};
