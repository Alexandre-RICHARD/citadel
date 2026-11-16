import { normalizeText } from "@citadel/common/src/universal/string/normalizeText.ts";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";

import type { ColumnValue } from "./columnValue.type.ts";

function isInRange<Value extends number | string>(
	value: ColumnValue,
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

/**
 * Une case passe-t-elle le filtre de sa colonne ? `value` : ce qu'elle affiche ; `texts` : les textes qu'y cherche un
 * filtre texte (le titre et le titre original, par exemple). Sans accents ni majuscules ; une valeur exacte (clic sur une
 * série) doit être tout le texte. Une case vide ne correspond à aucune valeur cochée, ni à aucun intervalle
 */
export function matchesColumnFilter<Column extends string>(
	filter: ColumnFilter<Column>,
	value: ColumnValue,
	texts: string[],
): boolean {
	switch (filter.kind) {
		case ColumnFilterKindEnum.TEXT: {
			const searched = normalizeText(filter.text);
			const normalizedTexts = texts.map(normalizeText);
			return filter.isExact
				? normalizedTexts.includes(searched)
				: normalizedTexts.some((text) => text.includes(searched));
		}
		case ColumnFilterKindEnum.VALUE:
			return typeof value === "string" && filter.values.includes(value);
		case ColumnFilterKindEnum.BOOLEAN:
			return value === filter.value;
		case ColumnFilterKindEnum.NUMBER_RANGE:
			return isInRange(value, "number", filter.min, filter.max);
		default:
			return isInRange(value, "string", filter.from, filter.to);
	}
}
