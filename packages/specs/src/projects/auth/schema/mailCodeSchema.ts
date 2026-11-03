import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";
import { digitCodeSchema } from "./digitCodeSchema.ts";

// Le code reçu par mail, 6 chiffres
export const mailCodeSchema = digitCodeSchema(AUTH_FIELD_LENGTHS.mailCode);
