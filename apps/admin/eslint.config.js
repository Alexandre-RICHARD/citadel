import clientConfig from "@citadel/eslint-config/client";
import globals from "globals";

export default [
	...clientConfig,

	// Le serveur de la console tourne sous Node : ses modules et ses variables globales
	{
		files: ["src/server/**/*.ts", "esbuildConfig.mjs"],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
		rules: {
			"import-x/no-nodejs-modules": "off",
			// Ni DTO ni couche api/ côté serveur, et packages/common/src/node y a sa place
			"no-restricted-imports": "off",
		},
	},
];
