import { CountBadge } from "@citadel/design-system/src/atoms/CountBadge";
import { ExpandToggle } from "@citadel/design-system/src/atoms/ExpandToggle";
import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { Pill } from "@citadel/design-system/src/atoms/Pill";
import { ConfirmDialog } from "@citadel/design-system/src/molecules/ConfirmDialog";
import { updateBossBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossBodySchema";
import { Flame, Pencil, Plus, Save, Shield, Trash2, X } from "lucide-react";
import { useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { useDeleteBoss } from "../../../../api/boss/useDeleteBoss";
import { useSetBossDefeated } from "../../../../api/boss/useSetBossDefeated";
import { useUpdateBoss } from "../../../../api/boss/useUpdateBoss";
import { useAddDeath } from "../../../../api/death/useAddDeath";
import { gameDeathCounterFieldLabels } from "../../../../api/gameDeathCounterFieldLabels";
import type { BossSummaryFm } from "../../../../api/model/bossSummaryFm.type";
import globalStyles from "../../../../globalStyles.module.scss";
import { BlockTitle } from "../BlockTitle";
import { BossBody } from "../BossBody";
import styles from "./bossRow.module.scss";

type Props = {
	gameId: number;
	boss: BossSummaryFm;
};

// Annonce ce que la suppression emporte avec le boss
function describeDeletion(totalDeath: number): string {
	if (totalDeath === 0) return "Cette action est définitive.";
	if (totalDeath === 1) return "Sa mort sera supprimée définitivement.";
	return `Ses ${totalDeath} morts seront supprimées définitivement.`;
}

export function BossRow({ gameId, boss }: Props) {
	const ids = { gameId, bossId: boss.id };

	// Déplié en mémoire seulement : les morts du boss se chargent à la première ouverture
	const [expanded, setExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const [draftName, setDraftName] = useState(boss.name);
	const [confirmingDeletion, setConfirmingDeletion] = useState(false);

	const updateBoss = useUpdateBoss(ids);
	const setBossDefeated = useSetBossDefeated(ids);
	const deleteBoss = useDeleteBoss(ids);
	const addDeath = useAddDeath(ids);

	// Le schéma de l'endpoint exige aussi le jeu, que la mutation ajoute elle-même
	const nameCheck = checkInput(
		updateBossBodySchema.pick({ name: true }),
		{ name: draftName },
		gameDeathCounterFieldLabels,
	);

	function toggleExpand() {
		setExpanded((wasExpanded) => !wasExpanded);
	}

	function startEditing() {
		setDraftName(boss.name);
		setEditing(true);
	}

	function save() {
		if (!nameCheck.isValid) return;
		updateBoss.mutate(nameCheck.data);
		setEditing(false);
	}

	function confirmDeletion() {
		setConfirmingDeletion(false);
		deleteBoss.mutate();
	}

	return (
		<li
			className={`${styles.bossCard} ${boss.isDefeated ? styles.bossCardDefeated : ""} ${boss.isTemporary ? globalStyles.temporary : ""}`}
			inert={boss.isTemporary}
		>
			<div className={styles.bossHeader}>
				<ExpandToggle
					expanded={expanded}
					onToggle={toggleExpand}
					expandLabel="Déplier le boss"
					collapseLabel="Replier le boss"
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
						name: boss.name,
						startedAt: boss.firstTry,
						endedAt: boss.defeatedAt,
					}}
				/>

				{boss.isDefeated && (
					<Pill>
						<Shield
							size={12}
							strokeWidth={2.4}
						/>
						vaincu
					</Pill>
				)}

				<CountBadge
					count={boss.totalDeath}
					icon={Flame}
					flickerIcon
					size="sm"
				/>

				<div className={globalStyles.sectionHeaderActions}>
					{editing ? (
						<>
							<IconButton
								icon={Save}
								label="Enregistrer"
								variant="primary"
								size="sm"
								disabled={!nameCheck.isValid}
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
									boss.isDefeated
										? "Marquer non vaincu"
										: "Marquer comme vaincu"
								}
								pressed={boss.isDefeated}
								size="sm"
								disabled={setBossDefeated.isPending}
								onClick={() =>
									setBossDefeated.mutate({ defeated: !boss.isDefeated })
								}
							/>
							<IconButton
								icon={Pencil}
								label="Modifier le boss"
								size="sm"
								disabled={updateBoss.isPending}
								onClick={startEditing}
							/>
							<IconButton
								icon={Trash2}
								label="Supprimer le boss"
								size="sm"
								variant="destructive"
								disabled={deleteBoss.isPending}
								onClick={() => setConfirmingDeletion(true)}
							/>
							<IconButton
								icon={Plus}
								label="Ajouter une mort (+1)"
								variant="accent"
								size="sm"
								disabled={addDeath.isPending}
								onClick={() => addDeath.mutate()}
							/>
						</>
					)}
				</div>
			</div>

			{expanded && (
				<BossBody
					gameId={gameId}
					bossId={boss.id}
				/>
			)}

			<ConfirmDialog
				open={confirmingDeletion}
				title={`Supprimer « ${boss.name} » ?`}
				description={describeDeletion(boss.totalDeath)}
				confirmLabel="Supprimer"
				destructive
				onConfirm={confirmDeletion}
				onCancel={() => setConfirmingDeletion(false)}
			/>
		</li>
	);
}
