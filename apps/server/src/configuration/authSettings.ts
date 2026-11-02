import { buildAuthSettings } from "./buildAuthSettings.ts";
import { env } from "./env.ts";

// Seule porte du code de l'authentification vers ses variables d'environnement (section auth de env.ts)
export const authSettings = buildAuthSettings(env);
