import { normalizeText } from "@citadel/common/src/universal/string/normalizeText.ts";
import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type.ts";

import { getColumnValue } from "./getColumnValue.ts";
import type { UserGameView } from "./userGameView.type.ts";
import type { ViewRow } from "./viewRow.type.ts";

// Textes cherchés par un filtre « contient » : le nom VF, VO et le titre de version pour la colonne Nom
function getColumnTexts(column: BacklogColumnEnum, row: ViewRow): string[] {
	const texts =
		column === BacklogColumnEnum.NAME
			? [row.frenchName, row.name, row.versionTitle]
			: [getColumnValue(column, row)];
	return texts.filter((text) => typeof text === "string");
}

function isInRange<Value extends number | string>(
	value: unknown,
	type: "number" | "string",
	min: Value | null,
	max: Value | null,
): boolean {
	return (
		typeof value === type &&
		(min === null || (value as Value) >= min) &&
		(max === null || (value as Value) <= max)
	);
}

// Sans accents ni majuscules ; une valeur exacte (clic sur une série) doit être tout le texte
function matchesFilter(row: ViewRow, filter: ColumnFilter): boolean {
	switch (filter.kind) {
		case ColumnFilterKindEnum.TEXT: {
			const searched = normalizeText(filter.text);
			const texts = getColumnTexts(filter.column, row).map(normalizeText);
			return filter.isExact
				? texts.includes(searched)
				: texts.some((text) => text.includes(searched));
		}
		case ColumnFilterKindEnum.VALUE:
		case ColumnFilterKindEnum.BOOLEAN:
			return getColumnValue(filter.column, row) === filter.value;
		case ColumnFilterKindEnum.NUMBER_RANGE:
			return isInRange(
				getColumnValue(filter.column, row),
				"number",
				filter.min,
				filter.max,
			);
		default:
			return isInRange(
				getColumnValue(filter.column, row),
				"string",
				filter.from,
				filter.to,
			);
	}
}

/**
 * Un jeu reste affiché si sa ligne, ou au moins une de ses versions jouées, correspond à tous les filtres (cahier des
 * charges, §9) : Plateforme = PS4 garde les jeux qui ont une version jouée sur PS4
 */
export function filterUserGameViews(
	views: UserGameView[],
	filters: ColumnFilter[],
): UserGameView[] {
	if (filters.length === 0) return views;

	return views.filter(({ row, userVersionRows }) =>
		[row, ...userVersionRows].some((candidate) =>
			filters.every((filter) => matchesFilter(candidate, filter)),
		),
	);
}
