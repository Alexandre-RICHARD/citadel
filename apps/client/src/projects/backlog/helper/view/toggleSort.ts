import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type";

// Clic sur un en-tête : croissant, décroissant, puis plus de tri ; une nouvelle colonne passe après les autres
export function toggleSort<Column extends string>(
	sort: SortCriterion<Column>[],
	column: Column,
): SortCriterion<Column>[] {
	const current = sort.find((criterion) => criterion.column === column);
	if (current === undefined)
		return [...sort, { column, direction: SortDirectionEnum.ASC }];
	if (current.direction === SortDirectionEnum.ASC)
		return sort.map((criterion) =>
			criterion.column === column
				? { column, direction: SortDirectionEnum.DESC }
				: criterion,
		);
	return sort.filter((criterion) => criterion.column !== column);
}
