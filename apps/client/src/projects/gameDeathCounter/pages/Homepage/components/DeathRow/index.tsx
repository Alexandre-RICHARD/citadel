import { formatDateTime } from "@citadel/common/src/universal/date/formatDateTime";
import { fromDateTimeInputValue } from "@citadel/common/src/universal/date/fromDateTimeInputValue";
import { toDateTimeInputValue } from "@citadel/common/src/universal/date/toDateTimeInputValue";
import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { updateDeathBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathBodySchema";
import { Pencil, Save, Skull, Trash2, X } from "lucide-react";
import { useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { useDeleteDeath } from "../../../../api/death/useDeleteDeath";
import { useUpdateDeath } from "../../../../api/death/useUpdateDeath";
import { gameDeathCounterFieldLabels } from "../../../../api/gameDeathCounterFieldLabels";
import type { DeathFm } from "../../../../api/model/deathFm.type";
import globalStyles from "../../../../globalStyles.module.scss";
import styles from "./deathRow.module.scss";

type Props = {
	gameId: number;
	bossId: number;
	death: DeathFm;
};

export function DeathRow({ gameId, bossId, death }: Props) {
	const ids = { gameId, bossId, deathId: death.id };

	const [editing, setEditing] = useState(false);
	const [draftComment, setDraftComment] = useState("");
	const [draftDate, setDraftDate] = useState("");

	const updateDeath = useUpdateDeath(ids);
	const deleteDeath = useDeleteDeath(ids);

	// Seuls les champs modifiés partent : la saisie à la minute ne doit pas réécrire les secondes d'une date inchangée
	const patch = {
		...(draftDate !== toDateTimeInputValue(death.date) && {
			date: fromDateTimeInputValue(draftDate) ?? "",
		}),
		...(draftComment !== (death.comment ?? "") && { comment: draftComment }),
	};
	const hasChanges = Object.keys(patch).length > 0;
	const patchCheck = hasChanges
		? checkInput(updateDeathBodySchema, patch, gameDeathCounterFieldLabels)
		: null;

	function startEditing() {
		setDraftDate(toDateTimeInputValue(death.date));
		setDraftComment(death.comment ?? "");
		setEditing(true);
	}

	function save() {
		if (patchCheck?.isValid === false) return;
		if (patchCheck?.isValid) updateDeath.mutate(patchCheck.data);
		setEditing(false);
	}

	if (editing) {
		return (
			<li className={`${styles.deathRow} ${styles.deathRowEditing}`}>
				<div className={styles.deathEditFields}>
					<input
						type="datetime-local"
						value={draftDate}
						max={toDateTimeInputValue(new Date())}
						onChange={(e) => setDraftDate(e.target.value)}
						aria-label="Date de la mort"
						aria-invalid={patchCheck?.isValid === false}
						className={`${globalStyles.fieldInput} ${globalStyles.fieldInputDate}`}
					/>
					<input
						type="text"
						value={draftComment}
						onChange={(e) => setDraftComment(e.target.value)}
						placeholder="Commentaire (optionnel)"
						aria-label="Commentaire"
						className={`${globalStyles.fieldInput} ${globalStyles.fieldInputComment}`}
					/>
				</div>
				<div className={styles.deathRowActions}>
					<IconButton
						icon={Save}
						label="Enregistrer"
						variant="primary"
						disabled={patchCheck?.isValid === false}
						onClick={save}
					/>
					<IconButton
						icon={X}
						label="Annuler"
						onClick={() => setEditing(false)}
					/>
				</div>
				{patchCheck?.isValid === false && (
					<p className={`${globalStyles.inputError} ${styles.deathEditError}`}>
						{patchCheck.message}
					</p>
				)}
			</li>
		);
	}

	return (
		<li
			className={`${styles.deathRow} ${death.isTemporary ? globalStyles.temporary : ""}`}
			inert={death.isTemporary}
		>
			<Skull
				size={14}
				strokeWidth={2}
				className={styles.deathIcon}
			/>
			<span className={`${styles.deathDate} ${globalStyles.mono}`}>
				{formatDateTime(death.date)}
			</span>
			<span className={styles.deathComment}>
				{death.comment ?? <em className={styles.muted}>sans commentaire</em>}
			</span>
			<div className={styles.deathRowActions}>
				<IconButton
					icon={Pencil}
					label="Modifier cette mort"
					size="sm"
					disabled={updateDeath.isPending}
					onClick={startEditing}
				/>
				<IconButton
					icon={Trash2}
					label="Supprimer cette mort"
					size="sm"
					variant="destructive"
					disabled={deleteDeath.isPending}
					onClick={() => deleteDeath.mutate()}
				/>
			</div>
		</li>
	);
}
