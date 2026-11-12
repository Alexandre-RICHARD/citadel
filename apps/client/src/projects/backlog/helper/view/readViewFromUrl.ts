import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";
import { parseFilterParam } from "@citadel/specs/src/projects/backlog/helper/view/parseFilterParam";
import { parseSortParam } from "@citadel/specs/src/projects/backlog/helper/view/parseSortParam";
import { ViewParamSyntaxEnum } from "@citadel/specs/src/projects/backlog/helper/view/viewParamSyntax.enum";

import type { BacklogView } from "./backlogView.type";

// Tri et filtres de l'URL de la page ; un paramètre illisible est ignoré (lien ancien, saisie à la main)
export function readViewFromUrl(search: string): BacklogView {
	const params = new URLSearchParams(search);
	return {
		sort:
			parseSortParam(params.get(ViewParamSyntaxEnum.SORT_PARAM) ?? "") ?? [],
		filterMode:
			params.get(ViewParamSyntaxEnum.FILTER_MODE_PARAM) === FilterModeEnum.OR
				? FilterModeEnum.OR
				: FilterModeEnum.AND,
		filters: Object.values(BacklogColumnEnum).flatMap((column) => {
			const text = params.get(column);
			const filter = text === null ? null : parseFilterParam(column, text);
			return filter === null ? [] : [filter];
		}),
	};
}
