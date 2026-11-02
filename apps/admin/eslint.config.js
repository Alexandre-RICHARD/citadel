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
			// Les règles du front (DTO, couche api/, common/node) ne valent pas ici : packages/common/src/node
			// y a sa place. Mais le code du navigateur de common, jamais
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: [
								"@citadel/common/src/browser/**",
								"@citadel/common/src/react/**",
							],
							message:
								"Le serveur de la console tourne sous Node : ni src/browser ni src/react de common.",
						},
					],
				},
			],
		},
	},
];
