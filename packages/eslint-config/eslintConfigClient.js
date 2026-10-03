import baseConfig from "./eslintConfigBase.js";
import reactConfig from "./eslintConfigReact.js";

export default [
	...baseConfig,
	...reactConfig,

	// Main rules
	{
		// Seule la couche api/ d'un projet parle au réseau et manipule les DTO ; le reste de l'app ne voit que des Front Models
		files: ["src/**/*.{ts,tsx}"],
		ignores: ["src/projects/*/api/**", "src/common/api/**"],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: [
								"@citadel/specs/src/projects/**/*Dto.type",
								"@citadel/specs/src/projects/**/*Dto.type.ts",
								"@citadel/specs/src/projects/**/*.interface",
								"@citadel/specs/src/projects/**/*.interface.ts",
							],
							message:
								"Un DTO ou une interface d'endpoint ne s'utilise que dans la couche api/ du projet : utiliser son Front Model (FM).",
						},
						{
							group: ["**/common/api/fetch/**"],
							message:
								"Un appel réseau passe par un hook de la couche api/ du projet.",
						},
					],
				},
			],
		},
	},
	// Override
	{
		// Le dossier d'un projet garde le nom du projet, en camelCase comme côté serveur et specs
		files: ["src/projects/*/index.tsx"],
		rules: {
			"citadel/component-folder-case": "off",
		},
	},
];
