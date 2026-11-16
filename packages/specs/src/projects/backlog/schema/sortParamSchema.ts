import { z } from "zod";

import type { ColumnFilterKinds } from "../helper/view/columnFilterKinds.type.ts";
import { parseSortParam } from "../helper/view/parseSortParam.ts";

// Tri dans la query, écrit comme dans l'URL de la page (`releaseDate:desc,name:asc`) ; il reste du texte, lu par le serveur
export function sortParamSchema<Column extends string>(
	kinds: ColumnFilterKinds<Column>,
) {
	return z
		.string({ message: "Sort should be a string" })
		.refine((text) => parseSortParam(kinds, text) !== null, {
			message:
				'Sort is not readable: sortable columns with asc or desc, each once (e.g. "releaseDate:desc,name:asc")',
		})
		.default("");
}
