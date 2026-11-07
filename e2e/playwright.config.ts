import { defineConfig, devices } from "@playwright/test";

import { E2EUrlEnum } from "./src/dictionaries/e2eUrl.enum.ts";
import { buildLaunchOptions } from "./src/helpers/browser/buildLaunchOptions.ts";

const DISABLE_ANIMATION = true;

export default defineConfig({
	testDir: "./src/tests",
	// Traces, vidéos, captures : vidé à chaque lancement, donc séparé du rapport HTML
	outputDir: "report-e2e/artifacts",
	// Un test qui dépasse 60 s est un test qui s'est perdu : il échoue au lieu de bloquer la suite
	timeout: 60_000,
	expect: { timeout: 10_000 },
	// Pas de test.only oublié dans une suite complète
	forbidOnly: true,
	// Jamais de « relance jusqu'à ce que ça passe » : un test instable se corrige
	retries: 0,
	// Les tests d'un même fichier s'enchaînent ; les fichiers se répartissent sur les cœurs
	workers: 4,
	// html : le rapport à ouvrir (pnpm --filter @citadel/e2e report) ; list : une ligne par test dans le terminal
	reporter: [
		["list"],
		["html", { open: "never", outputFolder: "report-e2e/html" }],
	],
	use: {
		baseURL: E2EUrlEnum.SITE_URL,
		// Le certificat de Caddy en local n'est signé par personne
		ignoreHTTPSErrors: true,
		locale: "fr-FR",
		timezoneId: "Europe/Paris",
		// Le dossier de preuves d'un test échoué : trace (pas à pas, rejouable), vidéo, capture
		trace: "retain-on-failure",
		video: "retain-on-failure",
		screenshot: "only-on-failure",
		reducedMotion: DISABLE_ANIMATION ? "reduce" : "no-preference",
	},
	projects: [
		// Le mode normal : rapide, sans fenêtre
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				launchOptions: buildLaunchOptions(),
			},
		},
		// Le mode pour regarder : fenêtre visible, une action toutes les 600 ms (pnpm e2e:slow)
		{
			name: "slow",
			use: {
				...devices["Desktop Chrome"],
				headless: false,
				launchOptions: buildLaunchOptions(1500),
			},
		},
	],
});
