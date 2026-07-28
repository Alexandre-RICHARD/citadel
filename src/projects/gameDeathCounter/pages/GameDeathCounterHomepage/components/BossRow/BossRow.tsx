import {
	ChevronDown,
	ChevronRight,
	Pencil,
	Plus,
	Save,
	Shield,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";

import globalStyles from "../../../../globalStyles.module.scss";
import styles from './bossRow.module.scss';
import { Count } from "../Count/Count";
import { DeathRow } from "../DeathRow/DeathRow";
import type { Boss } from "../../game.type";
import { IconButton } from "../IconButton/IconButton";

type Props = {
	boss: Boss;
	expanded: boolean;
	onToggleExpand: () => void;
	onUpdate: (bossId: number, patch: { name: string }) => void;
	onDelete: (bossId: number) => void;
	onToggleDefeated: (bossId: number) => void;
	onAddDeath: (bossId: number) => void;
	onUpdateDeath: (
		bossId: number,
		deathId: number,
		patch: {
			comment: string | null;
			date: string;
		},
	) => void;
	onDeleteDeath: (bossId: number, deathId: number) => void;
};

export function BossRow({
	boss,
	expanded,
	onToggleExpand,
	onUpdate,
	onDelete,
	onToggleDefeated,
	onAddDeath,
	onUpdateDeath,
	onDeleteDeath,
}: Props) {
	const [editing, setEditing] = useState(false);
	const [draftName, setDraftName] = useState(boss.name);

	const totalDeath = boss.deaths.length;
	const sorted = [...boss.deaths].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	const save = () => {
		const trimmed = draftName.trim();
		if (!trimmed) return;
		onUpdate(boss.id, { name: trimmed });
		setEditing(false);
	};

	return (
		<li className={`${styles.bossCard} ${boss.defeatedAt ? styles.bossCardDefeated : ""}`}>
			<div className={styles.bossHeader}>
				<button
					type="button"
					className={globalStyles.expandTrigger}
					onClick={onToggleExpand}
					aria-expanded={expanded}
					aria-label={expanded ? "Replier le boss" : "Déplier le boss"}
				>
					{expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
				</button>

				{editing ? (
					<input
						type="text"
						value={draftName}
						onChange={(e) => setDraftName(e.target.value)}
						className={`${globalStyles.fieldInput} ${globalStyles.fieldInputInlineTitle}`}
						autoFocus
					/>
				) : (
					<span
						className={styles.bossName}
						onClick={onToggleExpand}
					>
						{boss.name}
					</span>
				)}

				{boss.defeatedAt && (
					<span className={globalStyles.finishedPill}>
						<Shield
							size={12}
							strokeWidth={2.4}
						/>
						vaincu
					</span>
				)}

				<Count
					count={totalDeath}
					size="sm"
				/>

				<div className={globalStyles.sectionHeaderActions}>
					{editing ? (
						<>
							<IconButton
								icon={Save}
								label="Enregistrer"
								variant="gold"
								size="sm"
								onClick={save}
							/>
							<IconButton
								icon={X}
								label="Annuler"
								size="sm"
								onClick={() => setEditing(false)}
							/>
						</>
					) : (
						<>
							<IconButton
								icon={Shield}
								label={
									boss.defeatedAt
										? "Marquer non vaincu"
										: "Marquer comme vaincu"
								}
								variant={boss.defeatedAt ? "gold-active" : "ghost"}
								size="sm"
								onClick={() => onToggleDefeated(boss.id)}
							/>
							<IconButton
								icon={Pencil}
								label="Modifier le boss"
								size="sm"
								onClick={() => setEditing(true)}
							/>
							<IconButton
								icon={Trash2}
								label="Supprimer le boss"
								size="sm"
								variant="danger"
								onClick={() => onDelete(boss.id)}
							/>
							<IconButton
								icon={Plus}
								label="Ajouter une mort (+1)"
								variant="ember"
								size="sm"
								onClick={() => onAddDeath(boss.id)}
							/>
						</>
					)}
				</div>
			</div>

			{expanded && (
				<div className={styles.bossBody}>
					{boss.deaths.length === 0 ? (
						<p className={globalStyles.emptyHint}>
							Aucune tentative enregistrée. Le bouton flamme ajoute la première
							mort.
						</p>
					) : (
						<ul className={styles.deathList}>
							{sorted.map((death) => (
								<DeathRow
									key={death.id}
									death={death}
									onUpdate={(
										deathId: number,
										patch: {
											comment: string | null;
											date: string;
										},
									) => onUpdateDeath(boss.id, deathId, patch)}
									onDelete={(deathId: number) =>
										onDeleteDeath(boss.id, deathId)
									}
								/>
							))}
						</ul>
					)}
				</div>
			)}
		</li>
	);
}
