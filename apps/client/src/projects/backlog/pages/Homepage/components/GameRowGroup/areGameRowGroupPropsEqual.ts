import { areShallowEquals } from "@citadel/common/src/universal/object/areShallowEquals";

import type { GameRowGroupProps } from "./gameRowGroupProps.type";
import { isPopoverOnRow } from "./isPopoverOnRow";

/**
 * Une ligne ne se redessine que si ce qu'elle affiche change : sa donnée, ses colonnes, son dépliage, le mode édition,
 * ou le panneau ouvert sur elle. Un panneau ouvert sur une autre ligne ne la concerne pas. Les fonctions du tableau se
 * comparent par identité : si l'une cesse d'être stable, les lignes se redessinent trop souvent, jamais de travers
 */
export function areGameRowGroupPropsEqual(
	previous: GameRowGroupProps,
	next: GameRowGroupProps,
): boolean {
	const { popover: previousPopover, ...previousControls } = previous.table;
	const { popover: nextPopover, ...nextControls } = next.table;
	const isPopoverConcerned =
		isPopoverOnRow(previousPopover, previous.row) ||
		isPopoverOnRow(nextPopover, next.row);
	return (
		previous.row === next.row &&
		previous.columns === next.columns &&
		previous.cellClassNames === next.cellClassNames &&
		previous.isExpanded === next.isExpanded &&
		areShallowEquals(previousControls, nextControls) &&
		(!isPopoverConcerned || previousPopover === nextPopover)
	);
}
