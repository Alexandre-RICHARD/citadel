import { fileURLToPath } from "node:url";

/**
 * Le media-state fictif versionné, sans aucun vrai nom de fichier, de torrent ni de tracker : pour la QA en dev et pour
 * pnpm prod:local, qui le copient avant de s'en servir (cocher « Vérifié » écrit dans verified/). Les tests d'intégration
 * écrivent chacun le leur (writeTestSurvey)
 */
export const MEDIA_STATE_FIXTURE_DIR = fileURLToPath(
	new URL("fixture/", import.meta.url),
);
