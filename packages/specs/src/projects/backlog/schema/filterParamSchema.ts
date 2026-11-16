import { z } from "zod";

import type { ColumnFilterKinds } from "../helper/view/columnFilterKinds.type.ts";
import { parseFilterParam } from "../helper/view/parseFilterParam.ts";

// Filtre d'une colonne dans la query, écrit comme dans l'URL de la page ; il reste du texte, lu par le serveur
export function filterParamSchema<Column extends string>(
	kinds: ColumnFilterKinds<Column>,
	column: Column,
) {
	return z
		.string({ message: `${column} filter should be a string` })
		.refine((text) => parseFilterParam(kinds, column, text) !== null, {
			message: `${column} filter is not readable (e.g. "zelda", "=The Witcher", "finished", "yes", "10..18", "2020-01-01..")`,
		})
		.optional();
}
