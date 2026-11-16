import {
	EllipsisVertical,
	Globe,
	ListOrdered,
	Palette,
	Trash2,
} from "lucide-react";
import { useRef } from "react";
import { createPortal } from "react-dom";

import type { MediaRowFm } from "../../../../api/model/media/mediaRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Menu } from "../../../../components/Menu";
import type { MenuItem } from "../../../../components/Menu/menuItem.type";
import type { MediaTableControls } from "../../mediaTableControls.type";

type Props = {
	row: MediaRowFm;
	table: MediaTableControls;
};

// Raison d'une saga qu'on ne peut pas réorganiser ; null si elle peut l'être
function getSagaReason(row: MediaRowFm): string | null {
	if (row.saga === null) return "Ce média n’est dans aucune saga";
	return row.saga.id < 0 ? "Saga en cours de création" : null;
}

/**
 * Menu « 3 points verticaux » d'un film ou d'une série, comme celui des jeux : toutes ses entrées servent aussi en lecture
 * seule. Le clic droit sur la ligne l'ouvre aussi (MediaRowGroup)
 */
export function MediaActionsCell({ row, table }: Props) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const pointerAnchorRef = useRef<HTMLSpanElement>(null);
	const rowRef = useRef<HTMLElement | null>(null);
	const { popover, setPopover, openModal } = table;
	const { userMediaId, saga } = row;
	const isOpen =
		popover?.kind === "actionsMenu" && popover.userMediaId === userMediaId;
	// Ouvert par clic droit : le menu s'ancre au curseur, pas au bouton
	const pointer = isOpen ? popover.pointer : null;

	const items: MenuItem[] = [
		{
			label: "Personnaliser",
			icon: Palette,
			href: null,
			disabledReason: null,
			onSelect: () => openModal({ kind: "customizeMedia", row }),
		},
		{
			label: "Réorganiser la saga",
			icon: ListOrdered,
			href: null,
			disabledReason: getSagaReason(row),
			onSelect: () => {
				if (saga !== null)
					openModal({
						kind: "reorderSaga",
						sagaId: saga.id,
						sagaName: saga.name,
						userMediaId,
					});
			},
		},
		{
			label: "Ouvrir sur TMDB",
			icon: Globe,
			href: row.tmdbUrl,
			disabledReason: null,
			isGroupStart: true,
			onSelect: () => undefined,
		},
		{
			label: "Retirer du backlog",
			icon: Trash2,
			href: null,
			disabledReason: null,
			isDanger: true,
			isGroupStart: true,
			onSelect: () => openModal({ kind: "confirmRemoval", row }),
		},
	];

	return (
		<span
			className={styles.popoverAnchor}
			data-popover
		>
			<Button
				ref={triggerRef}
				icon={EllipsisVertical}
				variant="ghost"
				size="sm"
				ariaLabel="Actions"
				ariaHaspopup="menu"
				ariaExpanded={isOpen}
				onClick={() =>
					setPopover(
						isOpen ? null : { kind: "actionsMenu", userMediaId, pointer: null },
					)
				}
				onKeyDown={(event) => {
					// ↓ ouvre le menu, comme Entrée
					if (event.key === "ArrowDown" && !isOpen) {
						event.preventDefault();
						setPopover({ kind: "actionsMenu", userMediaId, pointer: null });
					}
				}}
			/>
			{pointer !== null &&
				createPortal(
					<span
						ref={(element) => {
							pointerAnchorRef.current = element;
							rowRef.current = triggerRef.current?.closest("tr") ?? null;
						}}
						className={styles.pointerAnchor}
						style={{ left: pointer.x, top: pointer.y }}
						aria-hidden
						data-popover
					/>,
					document.body,
				)}
			{isOpen && (
				<Menu
					anchorRef={pointer === null ? triggerRef : pointerAnchorRef}
					returnFocusRef={pointer === null ? undefined : rowRef}
					placement={pointer === null ? "bottom-end" : "bottom-start"}
					items={items}
					ariaLabel="Actions"
					onClose={() => setPopover(null)}
				/>
			)}
		</span>
	);
}
