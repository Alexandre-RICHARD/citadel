import { authSettings } from "../../../configuration/authSettings.ts";
import { createAuthLimiter } from "./createAuthLimiter.ts";

// Les limites de toute l'authentification, en mémoire : une seule instance pour tous ses parcours. L'horloge est relue à
// chaque appel, pour suivre celle que les tests figent et avancent
export const authLimiter = createAuthLimiter(authSettings, () => Date.now());
