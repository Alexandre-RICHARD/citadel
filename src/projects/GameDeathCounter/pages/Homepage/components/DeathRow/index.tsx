import { Pencil, Save, Skull, Trash2, X } from "lucide-react";
import { useState } from "react";

import { formatDateTime } from "../../../../../../common/helpers/date/formatDateTime";
import { toDateInputValue } from "../../../../../../common/helpers/date/toDateInputValue";
import globalStyles from "../../../../globalStyles.module.scss";
import type { Death } from "../../game.type";
import { IconButton } from "../IconButton";
import styles from "./deathRow.module.scss";

type Props = {
	death: Death;
	onUpdate: (
		deathId: number,
		patch: {
			comment: string | null;
			date: string;
		},
	) => void;
	onDelete: (deathId: number) => void;
};

export function DeathRow({ death, onUpdate, onDelete }: Props) {
	const [editing, setEditing] = useState(false);
	const [draftComment, setDraftComment] = useState(death.comment ?? "");
	const [draftDate, setDraftDate] = useState(toDateInputValue(death.date));

	const save = () => {
		onUpdate(death.id, {
			comment: draftComment.trim() ? draftComment.trim() : null,
			date: new Date(draftDate).toISOString(),
		});
		setEditing(false);
	};

	if (editing) {
		return (
			<li className={`${styles.deathRow} ${styles.deathRowEditing}`}>
				<div className={styles.deathEditFields}>
					<input
						type="datetime-local"
						value={draftDate}
						onChange={(e) => setDraftDate(e.target.value)}
						className={`${globalStyles.fieldInput} ${globalStyles.fieldInputDate}`}
					/>
					<input
						type="text"
						value={draftComment}
						onChange={(e) => setDraftComment(e.target.value)}
						placeholder="Commentaire (optionnel)"
						className={`${globalStyles.fieldInput} ${globalStyles.fieldInputComment}`}
					/>
				</div>
				<div className={styles.deathRowActions}>
					<IconButton
						icon={Save}
						label="Enregistrer"
						variant="gold"
						onClick={save}
					/>
					<IconButton
						icon={X}
						label="Annuler"
						onClick={() => setEditing(false)}
					/>
				</div>
			</li>
		);
	}

	return (
		<li className={styles.deathRow}>
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
					onClick={() => setEditing(true)}
				/>
				<IconButton
					icon={Trash2}
					label="Supprimer cette mort"
					size="sm"
					variant="danger"
					onClick={() => onDelete(death.id)}
				/>
			</div>
		</li>
	);
}
