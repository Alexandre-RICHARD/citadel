import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { Bookmark, type LucideIcon, Play } from "lucide-react";

import { useUpdateUserMedia } from "../../../../api/media/useUpdateUserMedia";
import type { MediaRowFm } from "../../../../api/model/media/mediaRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Checkbox } from "../../../../components/Checkbox";
import { TextField } from "../../../../components/TextField";
import { Tooltip } from "../../../../components/Tooltip";
import type { MediaTableControls } from "../../mediaTableControls.type";

type Props = {
	column:
		| MediaColumnEnum.IN_PROGRESS
		| MediaColumnEnum.UP_NEXT
		| MediaColumnEnum.COMMENT;
	row: MediaRowFm;
	table: MediaTableControls;
};

/**
 * Colonnes saisies sur la ligne d'un média : « En cours », « À voir bientôt » et le commentaire, comme celles des jeux.
 * En lecture seule, une icône ou le texte ; en mode édition, une case ou un champ, enregistrés dès la saisie
 */
export function MediaDataCell({ column, row, table }: Props) {
	const updateUserMedia = useUpdateUserMedia(row.userMediaId, column);

	function renderCheckbox(
		checked: boolean,
		label: string,
		Icon: LucideIcon,
		field: "isInProgress" | "isUpNext",
	) {
		if (!table.isEditMode)
			return checked ? (
				<span
					className={joinClassNames(
						styles.booleanMark,
						field === "isInProgress"
							? styles.inProgressMark
							: styles.upNextMark,
					)}
					role="img"
					aria-label={label}
				>
					<Icon aria-hidden />
				</span>
			) : null;
		return (
			<Checkbox
				checked={checked}
				ariaLabel={label}
				size="sm"
				disabled={updateUserMedia.isPending}
				className={styles.cellCheckbox}
				onChange={() => updateUserMedia.mutate({ [field]: !checked })}
			/>
		);
	}

	if (column === MediaColumnEnum.IN_PROGRESS)
		return renderCheckbox(row.isInProgress, "En cours", Play, "isInProgress");
	if (column === MediaColumnEnum.UP_NEXT)
		return renderCheckbox(row.isUpNext, "À voir bientôt", Bookmark, "isUpNext");
	if (!table.isEditMode)
		return row.comment === null ? null : (
			<Tooltip
				content={row.comment}
				isWide
				className={styles.commentTooltip}
			>
				<span className={styles.comment}>{row.comment}</span>
			</Tooltip>
		);
	return (
		<TextField
			value={row.comment}
			label="Commentaire"
			variant="inline"
			placeholder="Ajouter…"
			className={styles.commentField}
			onCommit={(comment) => updateUserMedia.mutate({ comment })}
		/>
	);
}
