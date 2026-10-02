import baseConfig from "./eslintConfigBase.js";
import reactConfig from "./eslintConfigReact.js";

export default [
	...baseConfig,
	...reactConfig,

	// Main rules
	//
	// Override
	{
		// Le dossier d'un projet garde le nom du projet, en camelCase comme côté serveur et specs
		files: ["src/projects/*/index.tsx"],
		rules: {
			"citadel/component-folder-case": "off",
		},
	},
];
