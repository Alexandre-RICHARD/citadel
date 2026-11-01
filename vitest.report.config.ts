import { defineConfig, mergeConfig } from "vitest/config";

import rootConfig from "./vitest.config.ts";

// La config de `pnpm test-report` : celle de la racine, plus le rapport HTML et la couverture.
// Le reporter HTML de vitest 5 n'a plus d'`outputFile` : il écrit dans `.vitest/` par défaut,
// et seule son option `outputDir` change ce dossier (pas de drapeau en ligne de commande).
export default mergeConfig(
	rootConfig,
	defineConfig({
		test: {
			reporters: ["default", ["html", { outputDir: "./report" }]],
			coverage: { enabled: true },
		},
	}),
);
