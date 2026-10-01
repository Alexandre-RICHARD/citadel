import { CountBadge } from "@citadel/design-system/src/atoms/CountBadge";
import { ExpandToggle } from "@citadel/design-system/src/atoms/ExpandToggle";
import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { Pill } from "@citadel/design-system/src/atoms/Pill";
import { Check, Flame, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import globalStyles from "../../../../globalStyles.module.scss";
import type { Game } from "../../game.type";
import { BlockTitle } from "../BlockTitle";
import { BossRow } from "../BossRow";
import styles from "./gameCard.module.scss";

type Props = {
	game: Game;
	expanded: boolean;
	onToggleExpand: () => void;
	expandedBossIds: Set<number>;
	onToggleBossExpand: (bossId: number) => void;
	onUpdateGame: (gameId: number, gamePatch: { name: string }) => void;
	onDeleteGame: (gameId: number) => void;
	onToggleFinished: (gameId: number) => void;
	onAddBoss: (gameId: number, bossName: string) => void;
	onUpdateBoss: (
		gameId: number,
		bossId: number,
		patch: { name: string },
	) => void;
	onDeleteBoss: (gameId: number, bossId: number) => void;
	onToggleDefeated: (gameId: number, bossId: number) => void;
	onAddDeath: (gameId: number, bossId: number) => void;
	onUpdateDeath: (
		gameId: number,
		bossId: number,
		deathId: number,
		patch: {
			comment: string | null;
			date: string;
		},
	) => void;
	onDeleteDeath: (gameId: number, bossId: number, deathId: number) => void;
};

export function GameCard({
	game,
	expanded,
	onToggleExpand,
	expandedBossIds,
	onToggleBossExpand,
	onUpdateGame,
	onDeleteGame,
	onToggleFinished,
	onAddBoss,
	onUpdateBoss,
	onDeleteBoss,
	onToggleDefeated,
	onAddDeath,
	onUpdateDeath,
	onDeleteDeath,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	const [editing, setEditing] = useState(false);
	const [draftName, setDraftName] = useState(game.name);
	const [addingBoss, setAddingBoss] = useState(false);
	const [newBossName, setNewBossName] = useState("");

	const totalDeath = game.bosses.reduce((sum, b) => sum + b.deaths.length, 0);
	const isFinished = Boolean(game.endedAt);

	const saveGameName = () => {
		const trimmed = draftName.trim();
		if (!trimmed) return;
		onUpdateGame(game.id, { name: trimmed });
		setEditing(false);
	};

	useEffect(() => {
		if (addingBoss) {
			inputRef.current?.focus();
		}
	}, [addingBoss]);

	const submitNewBoss = () => {
		const trimmed = newBossName.trim();
		if (!trimmed) return;
		onAddBoss(game.id, trimmed);
		setNewBossName("");
		setAddingBoss(false);
	};

	return (
		<li
			className={`${styles.gameCard} ${isFinished ? styles.gameCardFinished : ""}`}
		>
			<div className={styles.gameHeader}>
				<ExpandToggle
					expanded={expanded}
					onToggle={onToggleExpand}
					expandLabel="Déplier le jeu"
					collapseLabel="Replier le jeu"
					size="lg"
				/>

				<BlockTitle
					editing={editing}
					draftName={draftName}
					setDraftName={setDraftName}
					onToggleExpand={onToggleExpand}
					element={{
						name: game.name,
						startedAt: game.startedAt,
						endedAt: game.endedAt,
					}}
				/>

				{isFinished && (
					<Pill>
						<Check
							size={12}
							strokeWidth={2.6}
						/>
						terminé
					</Pill>
				)}

				<CountBadge
					count={totalDeath}
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
									isFinished ? "Marquer non terminé" : "Marquer comme terminé"
								}
								pressed={isFinished}
								onClick={() => onToggleFinished(game.id)}
							/>
							<IconButton
								icon={Pencil}
								label="Modifier le jeu"
								onClick={() => setEditing(true)}
							/>
							<IconButton
								icon={Trash2}
								label="Supprimer le jeu"
								variant="destructive"
								onClick={() => onDeleteGame(game.id)}
							/>
						</>
					)}
				</div>
			</div>

			{expanded && (
				<div className={styles.gameBody}>
					{game.bosses.length === 0 && !addingBoss ? (
						<p className={globalStyles.emptyHint}>
							Aucun boss enregistré pour ce jeu.
						</p>
					) : (
						<ul className={styles.bossList}>
							{game.bosses.map((boss) => (
								<BossRow
									key={boss.id}
									boss={boss}
									expanded={expandedBossIds.has(boss.id)}
									onToggleExpand={() => onToggleBossExpand(boss.id)}
									onUpdate={(bossId: number, patch: { name: string }) =>
										onUpdateBoss(game.id, bossId, patch)
									}
									onDelete={(bossId: number) => onDeleteBoss(game.id, bossId)}
									onToggleDefeated={(bossId: number) =>
										onToggleDefeated(game.id, bossId)
									}
									onAddDeath={(bossId: number) => onAddDeath(game.id, bossId)}
									onUpdateDeath={(
										bossId: number,
										deathId: number,
										patch: {
											comment: string | null;
											date: string;
										},
									) => onUpdateDeath(game.id, bossId, deathId, patch)}
									onDeleteDeath={(bossId: number, deathId: number) =>
										onDeleteDeath(game.id, bossId, deathId)
									}
								/>
							))}
						</ul>
					)}

					{addingBoss ? (
						<div className={styles.addBossForm}>
							<input
								ref={inputRef}
								type="text"
								value={newBossName}
								onChange={(e) => setNewBossName(e.target.value)}
								placeholder="Nom du boss"
								className={globalStyles.fieldInput}
								onKeyDown={(e) => e.key === "Enter" && submitNewBoss()}
							/>
							<IconButton
								icon={Save}
								label="Ajouter"
								variant="primary"
								onClick={submitNewBoss}
							/>
							<IconButton
								icon={X}
								label="Annuler"
								onClick={() => setAddingBoss(false)}
							/>
						</div>
					) : (
						<button
							type="button"
							className={styles.addBossTrigger}
							onClick={() => setAddingBoss(true)}
						>
							<Plus
								size={16}
								strokeWidth={2.4}
							/>
							Ajouter un boss
						</button>
					)}
				</div>
			)}
		</li>
	);
}
