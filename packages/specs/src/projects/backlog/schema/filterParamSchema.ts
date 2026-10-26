import { z } from "zod";

import type { BacklogColumnEnum } from "../enum/backlogColumn.enum.ts";
import { parseFilterParam } from "../rule/view/parseFilterParam.ts";

// Filtre d'une colonne dans la query, écrit comme dans l'URL de la page ; il reste du texte, lu par le serveur
export function filterParamSchema(column: BacklogColumnEnum) {
	return z
		.string({ message: `${column} filter should be a string` })
		.refine((text) => parseFilterParam(column, text) !== null, {
			message: `${column} filter is not readable (e.g. "zelda", "=The Witcher", "finished", "oui", "10..18", "2020-01-01..")`,
		})
		.optional();
}
