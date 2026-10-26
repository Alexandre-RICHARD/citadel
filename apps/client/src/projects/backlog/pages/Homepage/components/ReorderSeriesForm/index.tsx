import { dropSeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/dropSeriesEntry";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/formatSeriesNumber";
import { getSeriesDrop } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/getSeriesDrop";
import { isSeriesSubNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/isSeriesSubNumber";
import { placeSeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/placeSeriesEntry";
import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/seriesEntry.type";
import { GripVertical, ListOrdered, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";

import type { SeriesEntryFm } from "../../../../api/model/seriesEntryFm.type";
import { useReorderSeries } from "../../../../api/series/useReorderSeries";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Modal } from "../../../../components/Modal";
import { Tooltip } from "../../../../components/Tooltip";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { getSeriesOrderConflicts } from "../../../../helper/series/getSeriesOrderConflicts";
import { ModalActions } from "../ModalActions";
import { ReleaseDateLabel } from "../ReleaseDateLabel";
import { SeriesNumberField } from "../SeriesNumberField";

// Décalage d'un sous-jeu, en pixels (3,2rem) : glisser de sa moitié vers la droite en fait un sous-jeu
const SUB_ENTRY_INDENT_PX = 32;

type Props = {
	seriesId: number;
	seriesName: string;
	gameId: number;
	storedEntries: SeriesEntryFm[];
	onClose: () => void;
};

/**
 * Glisser un jeu par sa poignée sur le trait entre deux lignes, décalé à droite pour en faire un sous-jeu, ou taper son
 * numéro. Un jeu sorti avant un jeu placé plus haut est signalé. Rien ne part avant « Valider »
 */
export function ReorderSeriesForm({
	seriesId,
	seriesName,
	gameId: currentGameId,
	storedEntries,
	onClose,
}: Props) {
	const [entries, setEntries] = useState<SeriesEntry[]>(() =>
		storedEntries.map(({ gameId, seriesNumber }) => ({ gameId, seriesNumber })),
	);
	// Glisser-déposer en cours : le jeu saisi, d'où il part à l'horizontale, et le trait visé
	const [draggedGameId, setDraggedGameId] = useState<number | null>(null);
	const dragStartX = useRef(0);
	const [gapIndex, setGapIndex] = useState<number | null>(null);
	const [wantsSub, setWantsSub] = useState(false);
	const reorderSeries = useReorderSeries(seriesId);

	const storedEntryById = new Map(
		storedEntries.map((entry) => [entry.gameId, entry]),
	);
	const shownEntries = entries.flatMap(
		({ gameId }) => storedEntryById.get(gameId) ?? [],
	);
	const conflicts = getSeriesOrderConflicts(shownEntries);
	const hasChanges = entries.some(
		({ gameId, seriesNumber }) =>
			storedEntryById.get(gameId)?.seriesNumber !== seriesNumber,
	);
	const draggedEntry =
		entries.find(({ gameId }) => gameId === draggedGameId) ?? null;
	let dropLevel: "sub" | "main" | null = null;
	if (draggedGameId !== null && gapIndex !== null)
		dropLevel = getSeriesDrop(entries, draggedGameId, gapIndex, wantsSub).isSub
			? "sub"
			: "main";

	function endDrag() {
		setDraggedGameId(null);
		setGapIndex(null);
	}

	// Le trait s'affiche au-dessus de la ligne qui suit, ou sous la dernière
	function getDropSide(index: number): "above" | "below" | undefined {
		if (gapIndex === index) return "above";
		return gapIndex === entries.length && index === entries.length - 1
			? "below"
			: undefined;
	}

	return (
		<Modal
			title="Réorganiser la série"
			subtitle={seriesName}
			icon={ListOrdered}
			actions={
				// Sans numéro changé, « Valider » reste inactif
				<ModalActions
					canValidate={hasChanges}
					onCancel={onClose}
					onValidate={() => {
						reorderSeries.mutate({ entries });
						onClose();
					}}
				/>
			}
			onClose={onClose}
		>
			<Callout className={styles.seriesHint}>
				Glisse un jeu par sa poignée entre deux lignes, un peu à droite pour en
				faire un sous-jeu, ou tape son numéro (3, 3.1).
			</Callout>
			<ol className={styles.seriesList}>
				{entries.map(({ gameId, seriesNumber }, index) => {
					const game = storedEntryById.get(gameId);
					const storedNumber = game?.seriesNumber;
					const isChanged = seriesNumber !== storedNumber;
					const conflict = conflicts.get(gameId);
					const conflictLabel =
						conflict === undefined
							? null
							: `Sorti avant ${conflict.frenchName ?? conflict.name}, placé plus haut`;
					const otherEntries = entries.filter(
						(entry) => entry.gameId !== gameId,
					);
					const gameName =
						game === undefined
							? `jeu ${gameId}`
							: (game.frenchName ?? game.name);
					return (
						<li
							key={gameId}
							className={styles.seriesEntry}
							data-sub={isSeriesSubNumber(seriesNumber) || undefined}
							data-current={gameId === currentGameId || undefined}
							data-conflict={conflict !== undefined || undefined}
							data-dragged={gameId === draggedGameId || undefined}
							data-drop-side={getDropSide(index)}
							data-drop-level={
								getDropSide(index) === undefined ? undefined : dropLevel
							}
							onDragOver={(event) => {
								if (draggedEntry === null) return;
								// Autorise le dépôt : la moitié haute de la ligne vise le trait au-dessus, la moitié basse celui en dessous
								event.preventDefault();
								const row = event.currentTarget.getBoundingClientRect();
								setGapIndex(
									event.clientY > row.top + row.height / 2 ? index + 1 : index,
								);
								const indent =
									(isSeriesSubNumber(draggedEntry.seriesNumber)
										? SUB_ENTRY_INDENT_PX
										: 0) +
									event.clientX -
									dragStartX.current;
								setWantsSub(indent >= SUB_ENTRY_INDENT_PX / 2);
							}}
							onDrop={(event) => {
								event.preventDefault();
								if (draggedGameId !== null && gapIndex !== null)
									setEntries(
										dropSeriesEntry(entries, draggedGameId, gapIndex, wantsSub),
									);
								endDrag();
							}}
						>
							<Tooltip content="Glisser pour déplacer">
								<span
									className={styles.dragHandle}
									draggable
									onDragStart={(event) => {
										// Firefox ne lance le glisser qu'avec une donnée ; l'image glissée est toute la ligne
										event.dataTransfer.setData("text/plain", String(gameId));
										const row = event.currentTarget.closest("li");
										if (row !== null)
											event.dataTransfer.setDragImage(row, 0, 0);
										dragStartX.current = event.clientX;
										setDraggedGameId(gameId);
									}}
									onDragEnd={endDrag}
								>
									<GripVertical aria-hidden />
								</span>
							</Tooltip>
							<Tooltip
								content={
									isChanged
										? `Avant : ${storedNumber === undefined ? "aucun" : formatSeriesNumber(storedNumber, otherEntries)}`
										: null
								}
							>
								<SeriesNumberField
									value={seriesNumber}
									entries={otherEntries}
									isLive={false}
									className={joinClassNames(
										styles.seriesEntryNumber,
										isChanged && styles.changedSeriesNumber,
									)}
									ariaLabel={`N° de ${gameName}`}
									onCommit={(nextNumber) =>
										setEntries(placeSeriesEntry(entries, gameId, nextNumber))
									}
								/>
							</Tooltip>
							{game === undefined ? (
								<span>Jeu introuvable</span>
							) : (
								<>
									<span className={styles.nameBlock}>
										<span className={styles.primaryName}>
											{game.frenchName ?? game.name}
										</span>
										{game.frenchName !== null && (
											<span className={styles.secondaryName}>{game.name}</span>
										)}
									</span>
									<ReleaseDateLabel
										date={game.firstReleaseDate}
										isCancelled={false}
									/>
								</>
							)}
							<span className={styles.seriesEntryWarning}>
								{conflictLabel !== null && (
									<Tooltip
										content={conflictLabel}
										placement="left"
									>
										<span
											className={styles.conflictIcon}
											role="img"
											aria-label={conflictLabel}
										>
											<TriangleAlert aria-hidden />
										</span>
									</Tooltip>
								)}
							</span>
						</li>
					);
				})}
			</ol>
		</Modal>
	);
}
