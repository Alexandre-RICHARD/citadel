import react from "@vitejs/plugin-react-swc";
import { existsSync } from "fs";
import path from "path";
import { defineConfig, loadEnv } from "vite";

import { projects } from "./src/react/appNavigation/projects.dictionnary";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		server: {
			port: parseInt(env.VITE_LOCAL_PORT, 10),
			strictPort: true,
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
				"@styles": path.resolve(__dirname, "src/styles"),
				"@specs": path.resolve(__dirname, "alex-specs/src"),
			},
		},
		plugins: [react()],
		build: {
			assetsInlineLimit: 0,
			assetsDir: "./",
			cssCodeSplit: true,
			manifest: true,
			outDir: "./build",
			rollupOptions: {
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
					manualChunks: (id) => {
						// Normalisation des séparateurs de chemin (compatible Windows / Linux)
						const normalizedId = id.replace(/\\/g, "/");

						if (normalizedId.includes("node_modules")) {
							return "vendor";
						}

						// Découpage des traductions
						const translationMatch =
							/\/src\/.*\/translations\/([^/]+)\/.*\.translations\.(ts|js|json)$/.exec(
								normalizedId,
							);
						if (translationMatch) {
							const language = translationMatch[1];
							return `translations-${language}`;
						}

						if (normalizedId.includes("/src/components/")) {
							return "common";
						}

						for (const project of Object.values(projects)) {
							if (normalizedId.includes(project.buildPath)) {
								return project.outputFile;
							}
						}

						if (normalizedId.includes("/src/")) {
							return "app";
						}

						return "other";
					},
				},
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern-compiler",
					additionalData: (content, filename) => {
						const normalizedFilename = filename.replace(/\\/g, "/");

						if (normalizedFilename.endsWith("variables.scss")) {
							return content;
						}

						// Recherche le nom du projet dans le chemin
						const match = /\/src\/projects\/([^/]+)/.exec(normalizedFilename);

						if (match) {
							const projectName = match[1];
							const projectSCSSVariablesFilePath = path.resolve(
								__dirname,
								`src/projects/${projectName}/variables.scss`,
							);

							if (existsSync(projectSCSSVariablesFilePath)) {
								const normalizedPath = projectSCSSVariablesFilePath.replace(
									/\\/g,
									"/",
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
