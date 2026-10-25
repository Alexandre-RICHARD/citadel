// eslint-disable-next-line import-x/no-nodejs-modules
import { existsSync } from "node:fs";
// eslint-disable-next-line import-x/no-nodejs-modules
import path from "node:path";

import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Normalisation des séparateurs de chemin (compatible Windows / Linux)
function normalizePath(id: string): string {
	return id.replace(regexDictionary.windowsPathSeparator, "/");
}

export default defineConfig(({ mode }) => {
	const dirname = import.meta.dirname;
	// Racine du dépôt : pnpm lance Vite depuis apps/client, le .env est deux dossiers plus haut
	const rootDir = path.resolve(dirname, "../..");

	// .env de la racine, lu côté Node : port de dev, identifiants du proxy IGDB…
	const env = loadEnv(mode, rootDir, "");

	return {
		// Les éventuelles variables VITE_* viendront aussi de la racine (publiques : jamais de secret en VITE_)
		envDir: rootDir,
		server: {
			port: Number(env.CLIENT_DEV_PORT),
			strictPort: true,
			proxy: {
				// Le front appelle /api comme en prod ; en dev, Vite relaie vers le serveur local
				"/api": {
					target: `http://localhost:${env.SERVER_PORT}`,
					rewrite: (requestPath) => requestPath.slice("/api".length),
				},
				// POC Backlog : relais vers IGDB (pas de CORS chez IGDB, identifiants gardés côté serveur de dev)
				"/igdb/": {
					target: "https://api.igdb.com/v4",
					changeOrigin: true,
					rewrite: (requestPath) => requestPath.slice("/igdb".length),
					headers: {
						"Client-ID": env.INTERNET_GAME_DATA_BASE_CLIENT_ID,
						"Authorization": `Bearer ${env.INTERNET_GAME_DATA_BASE_TOKEN}`,
					},
				},
				"/irigo": {
					target: "https://ara-api.enroute.mobi",
					changeOrigin: true,
				},
			},
		},
		resolve: {
			alias: {
				"@": path.resolve(dirname, "src"),
				"@styles": path.resolve(dirname, "src/styles"),
			},
		},
		plugins: [react()],
		build: {
			assetsInlineLimit: 0,
			assetsDir: "./",
			cssCodeSplit: true,
			manifest: true,
			outDir: "./build",
			rolldownOptions: {
				input: { app: "./index.html" },
				output: {
					assetFileNames: (assetInfo) => {
						const fileName =
							assetInfo.names?.[0] ?? assetInfo.originalFileNames?.[0] ?? "";
						const extType = fileName.split(".").pop()?.toLowerCase();

						if (extType === "png") {
							return "assets/images/[name]-[hash][extname]";
						}
						if (extType === "ico") {
							return "assets/[name][extname]";
						}
						return "[name]-[hash][extname]";
					},
					// Un groupe embarque aussi les dépendances des modules qu'il capture :
					// les priorités décident qui passe en premier, sinon "app" avalerait React & co, et un projet le code partagé
					codeSplitting: {
						groups: [
							{
								name: "vendor",
								test: regexDictionary.nodeModulesPath,
								priority: 5,
							},
							{
								name: "design-system",
								debugName: "design-system",
								test: regexDictionary.designSystemPackagePath,
								priority: 4,
							},
							{
								name: (id) => {
									const translationMatch =
										regexDictionary.clientTranslationFile.exec(
											normalizePath(id),
										);
									return translationMatch
										? `translations-${translationMatch[1]}`
										: null;
								},
								debugName: "translation",
								priority: 3,
							},
							{
								name: "app",
								debugName: "app",
								test: (id) => {
									const normalizedId = normalizePath(id);
									return (
										normalizedId.includes("/src/") &&
										!normalizedId.includes("/src/projects/")
									);
								},
								priority: 2,
							},
							{
								name: (id) => {
									const projectMatch = regexDictionary.clientProjectFolder.exec(
										normalizePath(id),
									);
									return projectMatch ? `projects/${projectMatch[1]}` : null;
								},
								debugName: "project",
								priority: 1,
							},
						],
					},
				},
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern-compiler",
					additionalData: (content, filename) => {
						const normalizedFilename = normalizePath(filename);

						if (normalizedFilename.endsWith("variables.scss")) {
							return content;
						}

						// Recherche le nom du projet dans le chemin
						const match =
							regexDictionary.clientProjectFolder.exec(normalizedFilename);

						if (match) {
							const projectName = match[1];
							const projectSCSSVariablesFilePath = path.resolve(
								dirname,
								`src/projects/${projectName}/variables.scss`,
							);

							if (existsSync(projectSCSSVariablesFilePath)) {
								const normalizedPath = normalizePath(
									projectSCSSVariablesFilePath,
								);
								return `@use "${normalizedPath}" as vars;\n${content}`;
							}
						}

						return content;
					},
				},
			},
		},
	};
});
