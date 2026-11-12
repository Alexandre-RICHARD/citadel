import {
	CopyPlus,
	EllipsisVertical,
	Globe,
	ListOrdered,
	Palette,
	SquarePen,
	Trash2,
} from "lucide-react";
import { useRef } from "react";
import { createPortal } from "react-dom";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import type { UserVersionRowFm } from "../../../../api/model/userVersionRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Menu } from "../../../../components/Menu";
import type { MenuItem } from "../../../../components/Menu/menuItem.type";
import type { TableControls } from "../../tableControls.type";

type Props = {
	row: BacklogRowFm;
	// null : menu de la ligne du jeu
	userVersion: UserVersionRowFm | null;
	table: TableControls;
};

// Menu « 3 points verticaux » : toutes ses entrées servent aussi en lecture seule. Le clic droit sur la ligne l'ouvre aussi (GameRowGroup)
export function ActionsCell({ row, userVersion, table }: Props) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const pointerAnchorRef = useRef<HTMLSpanElement>(null);
	const rowRef = useRef<HTMLElement | null>(null);
	const { popover, setPopover, openModal } = table;
	const { gameId, series } = row;
	const userVersionId = userVersion?.userVersionId ?? null;
	const gameName = row.frenchName ?? row.name;
	const isOpen =
		popover?.kind === "actionsMenu" &&
		popover.gameId === gameId &&
		popover.userVersionId === userVersionId;
	// Ouvert par clic droit : le menu s'ancre au curseur, pas au bouton
	const pointer = isOpen ? popover.pointer : null;
	let seriesReason: string | null = null;
	if (series === null) seriesReason = "Ce jeu n’a pas de série";
	else if (series.id < 0) seriesReason = "Série en cours de création";
	const removal = {
		kind: "confirmRemoval" as const,
		gameId,
		gameName,
		userVersionCount: row.userVersionRows.length,
	};

	// Ligne du jeu, ou à version jouée unique : le menu du jeu ; sous-ligne : le menu de la version jouée
	const items: MenuItem[] =
		userVersion === null
			? [
					{
						label: "Personnaliser",
						icon: Palette,
						href: null,
						disabledReason: null,
						onSelect: () => openModal({ kind: "customizeGame", gameId }),
					},
					{
						label: "Réorganiser la série",
						icon: ListOrdered,
						href: null,
						disabledReason: seriesReason,
						onSelect: () => {
							if (series !== null)
								openModal({
									kind: "reorderSeries",
									seriesId: series.id,
									gameId,
								});
						},
					},
					{
						label: "Modifier le jeu",
						icon: SquarePen,
						href: null,
						disabledReason: null,
						onSelect: () => openModal({ kind: "editGame", gameId }),
					},
					{
						label: "Ajouter une version jouée",
						icon: CopyPlus,
						href: null,
						disabledReason: null,
						onSelect: () =>
							openModal({
								kind: "addUserVersion",
								gameId,
								versionId: null,
								imageIds: null,
								queuedIgdbIds: [],
							}),
					},
					{
						label: "Ouvrir sur IGDB",
						icon: Globe,
						href: row.igdbUrl,
						disabledReason: null,
						isGroupStart: true,
						onSelect: () => undefined,
					},
					{
						label: "Retirer le jeu du backlog",
						icon: Trash2,
						href: null,
						disabledReason: null,
						isDanger: true,
						isGroupStart: true,
						onSelect: () =>
							openModal({
								...removal,
								userVersionId: null,
								platformName: null,
							}),
					},
				]
			: [
					{
						label: "Ouvrir la version sur IGDB",
						icon: Globe,
						href: userVersion.igdbUrl,
						disabledReason: null,
						onSelect: () => undefined,
					},
					{
						label: "Retirer la version jouée",
						icon: Trash2,
						href: null,
						disabledReason: null,
						isDanger: true,
						isGroupStart: true,
						onSelect: () =>
							openModal({
								...removal,
								userVersionId: userVersion.userVersionId,
								platformName: userVersion.platform.shortName,
							}),
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
						isOpen
							? null
							: { kind: "actionsMenu", gameId, userVersionId, pointer: null },
					)
				}
				onKeyDown={(event) => {
					// ↓ ouvre le menu, comme Entrée
					if (event.key === "ArrowDown" && !isOpen) {
						event.preventDefault();
						setPopover({
							kind: "actionsMenu",
							gameId,
							userVersionId,
							pointer: null,
						});
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
