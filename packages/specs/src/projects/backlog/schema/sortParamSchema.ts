import { z } from "zod";

import { parseSortParam } from "../rule/view/parseSortParam.ts";

// Tri dans la query, écrit comme dans l'URL de la page (`releaseDate:desc,name:asc`) ; il reste du texte, lu par le serveur
export const sortParamSchema = z
	.string({ message: "Sort should be a string" })
	.refine((text) => parseSortParam(text) !== null, {
		message:
			'Sort is not readable: sortable columns with asc or desc, each once (e.g. "releaseDate:desc,name:asc")',
	})
	.default("");
