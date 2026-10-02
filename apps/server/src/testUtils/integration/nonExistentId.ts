import { IdBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/id/idBound.enum.ts";

// Id valide pour la validation mais jamais atteint par l'auto-incrément : garanti absent de la base de test
export const NON_EXISTENT_ID = IdBoundEnum.MAX;
