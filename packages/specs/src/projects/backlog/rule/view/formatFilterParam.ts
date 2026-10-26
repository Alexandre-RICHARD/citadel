import { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";
import type { ColumnFilter } from "./columnFilter.type.ts";
import { ViewParamSyntaxEnum } from "./viewParamSyntax.enum.ts";

// Filtre → sa valeur dans l'URL ou la query (inverse de parseFilterParam)
export function formatFilterParam(filter: ColumnFilter): string {
	switch (filter.kind) {
		case ColumnFilterKindEnum.TEXT:
			return filter.isExact
				? `${ViewParamSyntaxEnum.EXACT_PREFIX}${filter.text}`
				: filter.text;
		case ColumnFilterKindEnum.VALUE:
			return filter.value;
		case ColumnFilterKindEnum.BOOLEAN:
			return filter.value ? ViewParamSyntaxEnum.YES : ViewParamSyntaxEnum.NO;
		case ColumnFilterKindEnum.NUMBER_RANGE:
			return `${filter.min ?? ""}${ViewParamSyntaxEnum.RANGE_SEPARATOR}${filter.max ?? ""}`;
		default:
			return `${filter.from ?? ""}${ViewParamSyntaxEnum.RANGE_SEPARATOR}${filter.to ?? ""}`;
	}
}
