import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { isFinishedStatus } from "@citadel/specs/src/projects/backlog/rule/status/isFinishedStatus";
import { isStatusAllowed } from "@citadel/specs/src/projects/backlog/rule/status/isStatusAllowed";
import { Bookmark, type LucideIcon, PackageCheck } from "lucide-react";
import type { ReactNode } from "react";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import type { DlcFm } from "../../../../api/model/dlcFm.type";
import type { UserVersionRowFm } from "../../../../api/model/userVersionRowFm.type";
import { useUpdateUserVersion } from "../../../../api/userVersion/useUpdateUserVersion";
import styles from "../../../../backlog.module.scss";
import { Checkbox } from "../../../../components/Checkbox";
import { DateField } from "../../../../components/DateField";
import { DurationField } from "../../../../components/DurationField";
import { NumberField } from "../../../../components/NumberField";
import { Select } from "../../../../components/Select";
import { TextField } from "../../../../components/TextField";
import { Tooltip } from "../../../../components/Tooltip";
import { formatIsoDate } from "../../../../helper/date/formatIsoDate";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { formatDuration } from "../../../../helper/format/formatDuration";
import { formatFinishCount } from "../../../../helper/format/formatFinishCount";
import { statusLabels } from "../../../../helper/label/statusLabels";
import type { TableControls } from "../../tableControls.type";
import { DlcCell } from "../DlcCell";
import { DlcProgress } from "../DlcProgress";
import { RatingBadge } from "../RatingBadge";
import { StatusBadge } from "../StatusBadge";

const MAX_RATING = 20;

type Props = {
	column: BacklogColumnEnum;
	// Agrégats de la ligne du jeu, ou valeurs d'une version jouée
	values: BacklogRowFm | UserVersionRowFm;
	// La version jouée modifiable dans la cellule ; null sur la ligne d'un jeu à plusieurs versions jouées
	userVersion: UserVersionRowFm | null;
	gameId: number;
	gameName: string;
	endingType: EndingTypeEnum;
	dlcs: DlcFm[];
	table: TableControls;
};

// Temps et compteurs : un zéro, valeur par défaut, s'affiche estompé pour laisser ressortir les valeurs saisies
function renderAmount(amount: number, text: string): ReactNode {
	return amount === 0 ? <span className={styles.zeroValue}>{text}</span> : text;
}

/**
 * Colonnes des données de l'utilisateur. Ligne du jeu à plusieurs versions jouées : agrégats en
 * lecture seule. Sous-ligne ou ligne à version jouée unique : les valeurs de la version jouée, modifiables en mode
 * édition, enregistrées dès la saisie
 */
export function UserVersionDataCell({
	column,
	values,
	userVersion,
	gameId,
	gameName,
	endingType,
	dlcs,
	table,
}: Props) {
	const updateUserVersion = useUpdateUserVersion(
		gameId,
		userVersion?.userVersionId ?? 0,
		column,
	);
	const editableUserVersion = table.isEditMode ? userVersion : null;

	// Case de la version jouée en mode édition ; sinon, une icône quand la valeur est vraie
	function renderCheckbox(
		checked: boolean,
		label: string,
		Icon: LucideIcon,
		field: "isUpNext" | "isOwned",
	) {
		if (editableUserVersion === null)
			return checked ? (
				<span
					className={joinClassNames(
						styles.booleanMark,
						column === BacklogColumnEnum.UP_NEXT && styles.upNextMark,
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
				disabled={updateUserVersion.isPending}
				className={styles.cellCheckbox}
				onChange={() => updateUserVersion.mutate({ [field]: !checked })}
			/>
		);
	}

	switch (column) {
		case BacklogColumnEnum.STATUS: {
			if (editableUserVersion === null)
				return values.status === null ? null : (
					<StatusBadge status={values.status} />
				);
			return (
				<Select
					value={editableUserVersion.status}
					// Liste filtrée par type de fin, le statut actuel compris
					options={Object.values(StatusEnum)
						.filter(
							(status) =>
								status === editableUserVersion.status ||
								isStatusAllowed(status, endingType),
						)
						.map((status) => ({
							value: status,
							label: statusLabels[status].label,
							content: <StatusBadge status={status} />,
						}))}
					ariaLabel="Statut"
					variant="inline"
					size="sm"
					onChange={(status) => {
						updateUserVersion.mutate({ status });
						// Au rang 5 ou plus sans date de fin, une petite fenêtre la propose
						if (
							isFinishedStatus(status) &&
							editableUserVersion.finishDate === null
						)
							table.openModal({
								kind: "setFinishDate",
								gameId,
								userVersionId: editableUserVersion.userVersionId,
								gameName,
								platformName: editableUserVersion.platform.shortName,
							});
					}}
				/>
			);
		}
		case BacklogColumnEnum.UP_NEXT:
			return renderCheckbox(
				values.isUpNext,
				"À jouer bientôt",
				Bookmark,
				"isUpNext",
			);
		case BacklogColumnEnum.OWNED:
			return renderCheckbox(values.isOwned, "Possédé", PackageCheck, "isOwned");
		case BacklogColumnEnum.FINISH_DATE:
			if (editableUserVersion === null)
				return values.finishDate === null ? null : (
					<span className={styles.number}>
						{formatIsoDate(values.finishDate)}
					</span>
				);
			return (
				<DateField
					value={editableUserVersion.finishDate}
					label="Date de fin"
					variant="inline"
					onCommit={(finishDate) => updateUserVersion.mutate({ finishDate })}
				/>
			);
		case BacklogColumnEnum.FINISH_COUNT:
			if (editableUserVersion === null)
				return renderAmount(
					values.sureFinishCount + values.probableFinishCount,
					formatFinishCount(values.sureFinishCount, values.probableFinishCount),
				);
			return (
				<span className={styles.inlinePair}>
					<NumberField
						value={editableUserVersion.sureFinishCount}
						min={0}
						max={null}
						isNullable={false}
						label="Fois fini, sûr"
						variant="inline"
						digits={2}
						onCommit={(count) =>
							updateUserVersion.mutate({ sureFinishCount: count ?? 0 })
						}
					/>
					<span className={styles.fieldUnit}>+</span>
					<NumberField
						value={editableUserVersion.probableFinishCount}
						min={0}
						max={null}
						isNullable={false}
						label="Fois fini, probable"
						variant="inline"
						digits={2}
						onCommit={(count) =>
							updateUserVersion.mutate({ probableFinishCount: count ?? 0 })
						}
					/>
					<span className={styles.fieldUnit}>?</span>
				</span>
			);
		case BacklogColumnEnum.DLC:
			// La ligne d'un jeu à plusieurs versions jouées affiche « faits / total » en lecture seule
			if (userVersion === null)
				return values.dlcCount === 0 ? null : (
					<DlcProgress
						doneCount={values.doneDlcCount}
						totalCount={values.dlcCount}
					/>
				);
			// Sans DLC, la cellule reste vide, sauf en mode édition pour en rechercher
			if (values.dlcCount === 0 && !table.isEditMode) return null;
			return (
				<DlcCell
					gameId={gameId}
					gameName={gameName}
					userVersion={userVersion}
					dlcs={dlcs}
					table={table}
				/>
			);
		case BacklogColumnEnum.TRACKED_PLAY_TIME:
			if (editableUserVersion === null)
				return renderAmount(
					values.trackedPlayTimeMinutes,
					formatDuration(values.trackedPlayTimeMinutes),
				);
			return (
				<DurationField
					minutes={editableUserVersion.trackedPlayTimeMinutes}
					label="Temps relevé"
					variant="inline"
					onCommit={(minutes) =>
						updateUserVersion.mutate({ trackedPlayTimeMinutes: minutes })
					}
				/>
			);
		case BacklogColumnEnum.ESTIMATED_PLAY_TIME:
			if (editableUserVersion === null)
				return renderAmount(
					values.estimatedPlayTimeMinutes,
					formatDuration(values.estimatedPlayTimeMinutes),
				);
			return (
				<DurationField
					minutes={editableUserVersion.estimatedPlayTimeMinutes}
					label="Temps estimé"
					variant="inline"
					onCommit={(minutes) =>
						updateUserVersion.mutate({ estimatedPlayTimeMinutes: minutes })
					}
				/>
			);
		case BacklogColumnEnum.TOTAL_PLAY_TIME:
			return renderAmount(
				values.totalPlayTimeMinutes,
				formatDuration(values.totalPlayTimeMinutes),
			);
		case BacklogColumnEnum.RATING:
			if (editableUserVersion === null)
				return values.rating === null ? null : (
					<RatingBadge rating={values.rating} />
				);
			return (
				<span className={styles.inlinePair}>
					<NumberField
						value={editableUserVersion.rating}
						min={0}
						max={MAX_RATING}
						isNullable
						label="Note sur 20"
						variant="inline"
						digits={2}
						placeholder="–"
						onCommit={(rating) => updateUserVersion.mutate({ rating })}
					/>
					<span className={styles.fieldUnit}>/20</span>
				</span>
			);
		case BacklogColumnEnum.COMMENT:
			if (editableUserVersion === null)
				return values.comment === null ? null : (
					<Tooltip
						content={values.comment}
						isWide
						className={styles.commentTooltip}
					>
						<span className={styles.comment}>{values.comment}</span>
					</Tooltip>
				);
			return (
				<TextField
					value={editableUserVersion.comment}
					label="Commentaire"
					variant="inline"
					placeholder="Ajouter…"
					className={styles.commentField}
					onCommit={(comment) => updateUserVersion.mutate({ comment })}
				/>
			);
		default:
			return null;
	}
}
