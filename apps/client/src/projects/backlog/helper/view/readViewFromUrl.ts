import { readViewParams } from "@citadel/specs/src/projects/backlog/helper/view/readViewParams";

import type { BacklogView } from "./backlogView.type";
import type { TableDefinition } from "./tableDefinition.type";

// Tri et filtres de l'URL de la page ; un paramètre illisible est ignoré (lien ancien, saisie à la main)
export function readViewFromUrl<Column extends string>(
	table: TableDefinition<Column>,
	search: string,
): BacklogView<Column> {
	const params = new URLSearchParams(search);
	return readViewParams(table.kinds, (name) => params.get(name));
}
