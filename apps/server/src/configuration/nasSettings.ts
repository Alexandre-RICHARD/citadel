import { buildNasSettings } from "./buildNasSettings.ts";
import { env } from "./env.ts";

// Seule porte du mode connecté vers ses variables d'environnement ; null sur le serveur public et la pré-prod
export const nasSettings = buildNasSettings(env);
