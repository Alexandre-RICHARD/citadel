import { CountBadge } from "@citadel/design-system/src/atoms/CountBadge";
import { ExpandToggle } from "@citadel/design-system/src/atoms/ExpandToggle";
import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { Pill } from "@citadel/design-system/src/atoms/Pill";
import { ConfirmDialog } from "@citadel/design-system/src/molecules/ConfirmDialog";
import { updateGameBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/updateGame/updateGameBodySchema";
import { Check, Flame, Pencil, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { useDeleteGame } from "../../../../api/game/useDeleteGame";
import { useSetGameFinished } from "../../../../api/game/useSetGameFinished";
import { useUpdateGame } from "../../../../api/game/useUpdateGame";
import { gameDeathCounterFieldLabels } from "../../../../api/gameDeathCounterFieldLabels";
import type { GameSummaryFm } from "../../../../api/model/gameSummaryFm.type";
import globalStyles from "../../../../globalStyles.module.scss";
import { BlockTitle } from "../BlockTitle";
import { GameBody } from "../GameBody";
import styles from "./gameCard.module.scss";

type Props = {
	game: GameSummaryFm;
};

// Annonce ce que la suppression emporte avec le jeu
function describeDeletion(totalDeath: number): string {
	if (totalDeath === 0) return "Ses boss seront supprimés définitivement.";
	const deaths = totalDeath === 1 ? "sa mort" : `ses ${totalDeath} morts`;
	return `Ses boss et ${deaths} seront supprimés définitivement.`;
}

export function GameCard({ game }: Props) {
	// Déplié en mémoire seulement : le détail du jeu se charge à la première ouverture
	const [expanded, setExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const [draftName, setDraftName] = useState(game.name);
	const [confirmingDeletion, setConfirmingDeletion] = useState(false);

	const updateGame = useUpdateGame(game.id);
	const setGameFinished = useSetGameFinished(game.id);
	const deleteGame = useDeleteGame(game.id);

	const nameCheck = checkInput(
		updateGameBodySchema,
		{ name: draftName },
		gameDeathCounterFieldLabels,
	);

	function toggleExpand() {
		setExpanded((wasExpanded) => !wasExpanded);
	}

	function startEditing() {
		setDraftName(game.name);
		setEditing(true);
	}

	function saveGameName() {
		if (!nameCheck.isValid) return;
		updateGame.mutate(nameCheck.data);
		setEditing(false);
	}

	function confirmDeletion() {
		setConfirmingDeletion(false);
		deleteGame.mutate();
	}

	return (
		<li
			className={`${styles.gameCard} ${game.isFinished ? styles.gameCardFinished : ""} ${game.isTemporary ? globalStyles.temporary : ""}`}
			inert={game.isTemporary}
		>
			<div className={styles.gameHeader}>
				<ExpandToggle
					expanded={expanded}
					onToggle={toggleExpand}
					expandLabel="Déplier le jeu"
					collapseLabel="Replier le jeu"
					size="lg"
				/>

				<BlockTitle
					editing={editing}
					draftName={draftName}
					setDraftName={setDraftName}
					inputError={
						!nameCheck.isValid && draftName.trim() !== ""
							? nameCheck.message
							: null
					}
					onToggleExpand={toggleExpand}
					element={{
						name: game.name,
						startedAt: game.startedAt,
						endedAt: game.endedAt,
					}}
				/>

				{game.isFinished && (
					<Pill>
						<Check
							size={12}
							strokeWidth={2.6}
						/>
						terminé
					</Pill>
				)}

				<CountBadge
					count={game.totalDeath}
					icon={Flame}
					flickerIcon
				/>

				<div className={globalStyles.sectionHeaderActions}>
					{editing ? (
						<>
							<IconButton
								icon={Save}
								label="Enregistrer"
								variant="primary"
								disabled={!nameCheck.isValid}
								onClick={saveGameName}
							/>
							<IconButton
								icon={X}
								label="Annuler"
								onClick={() => setEditing(false)}
							/>
						</>
					) : (
						<>
							<IconButton
								icon={Check}
								label={
									game.isFinished
										? "Marquer non terminé"
										: "Marquer comme terminé"
								}
								pressed={game.isFinished}
								disabled={setGameFinished.isPending}
								onClick={() =>
									setGameFinished.mutate({ finished: !game.isFinished })
								}
							/>
							<IconButton
								icon={Pencil}
								label="Modifier le jeu"
								disabled={updateGame.isPending}
								onClick={startEditing}
							/>
							<IconButton
								icon={Trash2}
								label="Supprimer le jeu"
								variant="destructive"
								disabled={deleteGame.isPending}
								onClick={() => setConfirmingDeletion(true)}
							/>
						</>
					)}
				</div>
			</div>

			{expanded && <GameBody gameId={game.id} />}

			<ConfirmDialog
				open={confirmingDeletion}
				title={`Supprimer « ${game.name} » ?`}
				description={describeDeletion(game.totalDeath)}
				confirmLabel="Supprimer"
				destructive
				onConfirm={confirmDeletion}
				onCancel={() => setConfirmingDeletion(false)}
			/>
		</li>
	);
}
