import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { parseFilterParam } from "@citadel/specs/src/projects/backlog/rule/view/parseFilterParam";
import { parseSortParam } from "@citadel/specs/src/projects/backlog/rule/view/parseSortParam";
import { ViewParamSyntaxEnum } from "@citadel/specs/src/projects/backlog/rule/view/viewParamSyntax.enum";

import type { BacklogView } from "./backlogView.type";

// Tri et filtres de l'URL de la page ; un paramètre illisible est ignoré (lien ancien, saisie à la main)
export function readViewFromUrl(search: string): BacklogView {
	const params = new URLSearchParams(search);
	return {
		sort:
			parseSortParam(params.get(ViewParamSyntaxEnum.SORT_PARAM) ?? "") ?? [],
		filters: Object.values(BacklogColumnEnum).flatMap((column) => {
			const text = params.get(column);
			const filter = text === null ? null : parseFilterParam(column, text);
			return filter === null ? [] : [filter];
		}),
	};
}
