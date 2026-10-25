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
		},
	},
];
