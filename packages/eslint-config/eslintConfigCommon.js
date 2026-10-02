import baseConfig from "./eslintConfigBase.js";
import reactConfig from "./eslintConfigReact.js";

const BROWSER_GLOBALS = [
	"window",
	"document",
	"navigator",
	"location",
	"history",
	"localStorage",
	"sessionStorage",
];
const NODE_GLOBALS = [
	"process",
	"Buffer",
	"__dirname",
	"__filename",
	"require",
	"module",
];

function restrictGlobals(globalNames, message) {
	return globalNames.map((name) => ({ name, message }));
}

const UNIVERSAL_MESSAGE =
	"src/universal tourne sur le serveur et dans le navigateur : ni API navigateur, ni API Node";
const NOT_NODE_MESSAGE =
	"src/browser et src/react tournent dans le navigateur : pas d'API Node";

export default [
	...baseConfig,
	...reactConfig,

	// Main rules
	//
	// Override
	// Chaque dossier n'utilise que ce que son environnement d'exécution fournit
	{
		files: ["src/universal/**"],
		rules: {
			"no-restricted-globals": [
				"error",
				...restrictGlobals(BROWSER_GLOBALS, UNIVERSAL_MESSAGE),
				...restrictGlobals(NODE_GLOBALS, UNIVERSAL_MESSAGE),
			],
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: [
								"react",
								"react-dom",
								"node:*",
								"**/browser/**",
								"**/react/**",
							],
							message: UNIVERSAL_MESSAGE,
						},
					],
				},
			],
		},
	},
	{
		files: ["src/browser/**", "src/react/**"],
		rules: {
			"no-restricted-globals": [
				"error",
				...restrictGlobals(NODE_GLOBALS, NOT_NODE_MESSAGE),
			],
			"no-restricted-imports": [
				"error",
				{
					patterns: [{ group: ["node:*"], message: NOT_NODE_MESSAGE }],
				},
			],
		},
	},
];
