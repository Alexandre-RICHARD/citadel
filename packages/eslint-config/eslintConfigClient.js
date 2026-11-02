import baseConfig from "./eslintConfigBase.js";
import reactConfig from "./eslintConfigReact.js";

// Le code de packages/common/src/node utilise les modules de Node : jamais dans le navigateur
const COMMON_NODE_PATTERN = {
	group: ["@citadel/common/src/node/**"],
	message:
		"packages/common/src/node ne tourne que sous Node : le front utilise src/universal ou src/browser.",
};

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
						COMMON_NODE_PATTERN,
					],
				},
			],
		},
	},
	{
		files: ["src/projects/*/api/**", "src/common/api/**"],
		rules: {
			"no-restricted-imports": ["error", { patterns: [COMMON_NODE_PATTERN] }],
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
