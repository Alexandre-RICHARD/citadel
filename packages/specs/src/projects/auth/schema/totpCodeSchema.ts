import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";
import { digitCodeSchema } from "./digitCodeSchema.ts";

// Le code de l'application d'authentification, 6 chiffres
export const totpCodeSchema = digitCodeSchema(AUTH_FIELD_LENGTHS.totpCode);
