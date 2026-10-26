import { pathParamIdSchema } from "../id/pathParamIdSchema.ts";

// Numéro de page d'une liste paginée, lu dans la query comme un id de chemin (mêmes formats refusés) ; 1 sans paramètre
export function queryParamPageSchema(label: string) {
	return pathParamIdSchema(label).default(1);
}
