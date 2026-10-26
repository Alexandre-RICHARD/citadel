import { isoDateSchema } from "../../../../specUtils/schemaValidator/date/isoDateSchema.ts";
import type { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";
import type { ColumnFilter } from "./columnFilter.type.ts";
import { columnFilterKinds } from "./columnFilterKinds.ts";
import { ViewParamSyntaxEnum } from "./viewParamSyntax.enum.ts";

const dateSchema = isoDateSchema("Date");

// Borne d'un intervalle : vide = pas de borne (`undefined` pour la distinguer d'une borne illisible, `null`)
function parseNumberBound(text: string): number | null | undefined {
	if (text === "") return undefined;
	const number = Number(text);
	return Number.isFinite(number) ? number : null;
}

function parseDateBound(text: string): string | null | undefined {
	if (text === "") return undefined;
	return dateSchema.safeParse(text).success ? text : null;
}

// Les deux bornes, au moins une renseignée et chacune lisible ; `null` sinon
function parseRange<Bound>(
	text: string,
	parseBound: (boundText: string) => Bound | null | undefined,
): [Bound | null, Bound | null] | null {
	const [startText, endText, ...extra] = text.split(
		ViewParamSyntaxEnum.RANGE_SEPARATOR,
	);
	if (extra.length > 0 || endText === undefined) return null;

	const start = parseBound(startText ?? "");
	const end = parseBound(endText);
	if (start === null || end === null) return null;
	if (start === undefined && end === undefined) return null;
	return [start ?? null, end ?? null];
}

/**
 * Valeur d'un filtre lue dans l'URL ou la query : `zelda`, `=The Witcher`, `finished`, `oui`, `10..18`, `2020-01-01..`.
 * `null` si elle est vide, illisible, ou si la colonne n'a pas de filtre
 */
export function parseFilterParam(
	column: BacklogColumnEnum,
	text: string,
): ColumnFilter | null {
	switch (columnFilterKinds[column]) {
		case ColumnFilterKindEnum.TEXT: {
			const isExact = text.startsWith(ViewParamSyntaxEnum.EXACT_PREFIX);
			const searched = isExact
				? text.slice(ViewParamSyntaxEnum.EXACT_PREFIX.length)
				: text;
			return searched.trim() === ""
				? null
				: { column, kind: ColumnFilterKindEnum.TEXT, text: searched, isExact };
		}
		case ColumnFilterKindEnum.VALUE:
			return text === ""
				? null
				: { column, kind: ColumnFilterKindEnum.VALUE, value: text };
		case ColumnFilterKindEnum.BOOLEAN:
			return text === String(ViewParamSyntaxEnum.YES) ||
				text === String(ViewParamSyntaxEnum.NO)
				? {
						column,
						kind: ColumnFilterKindEnum.BOOLEAN,
						value: text === String(ViewParamSyntaxEnum.YES),
					}
				: null;
		case ColumnFilterKindEnum.NUMBER_RANGE: {
			const range = parseRange(text, parseNumberBound);
			return range === null
				? null
				: {
						column,
						kind: ColumnFilterKindEnum.NUMBER_RANGE,
						min: range[0],
						max: range[1],
					};
		}
		case ColumnFilterKindEnum.DATE_RANGE: {
			const range = parseRange(text, parseDateBound);
			return range === null
				? null
				: {
						column,
						kind: ColumnFilterKindEnum.DATE_RANGE,
						from: range[0],
						to: range[1],
					};
		}
		default:
			return null;
	}
}
