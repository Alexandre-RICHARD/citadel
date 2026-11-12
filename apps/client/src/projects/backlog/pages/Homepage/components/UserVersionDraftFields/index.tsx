import { toggleArrayItem } from "@citadel/common/src/universal/array/toggleArrayItem";
import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";

import type { DlcFm } from "../../../../api/model/dlcFm.type";
import styles from "../../../../backlog.module.scss";
import { Checkbox } from "../../../../components/Checkbox";
import { DateField } from "../../../../components/DateField";
import { DurationField } from "../../../../components/DurationField";
import { NumberField } from "../../../../components/NumberField";
import { Select } from "../../../../components/Select";
import { TextField } from "../../../../components/TextField";
import { statusLabels } from "../../../../helper/label/statusLabels";
import { getStatusChoices } from "../../../../helper/status/getStatusChoices";
import type { UserVersionDraft } from "../../userVersionDraft.type";
import { FormField } from "../FormField";
import { StatusBadge } from "../StatusBadge";

const MAX_RATING = 20;

type Props = {
	draft: UserVersionDraft;
	endingType: EndingTypeEnum | null;
	dlcs: DlcFm[];
	onChange: (draft: UserVersionDraft) => void;
};

// Données du joueur de la nouvelle version jouée, saisies comme dans le tableau
export function UserVersionDraftFields({
	draft,
	endingType,
	dlcs,
	onChange,
}: Props) {
	return (
		<div className={styles.formStack}>
			<div className={styles.formGrid}>
				<FormField
					label="Statut"
					isRequired
				>
					<Select
						value={draft.status}
						// Liste filtrée par type de fin ; sans type de fin, les statuts de fin sont grisés
						options={getStatusChoices(endingType, null).map(
							({ status, isDisabled }) => ({
								value: status,
								label: statusLabels[status].label,
								content: <StatusBadge status={status} />,
								disabled: isDisabled,
								hint: isDisabled ? "type de fin requis" : undefined,
							}),
						)}
						ariaLabel="Statut"
						className={styles.fullWidth}
						onChange={(status) => onChange({ ...draft, status })}
					/>
				</FormField>
				<FormField label="Date de fin">
					<DateField
						value={draft.finishDate}
						label="Date de fin"
						onCommit={(finishDate) => onChange({ ...draft, finishDate })}
					/>
				</FormField>
				<FormField
					label="Fois fini"
					hint="Sûr, puis probable"
				>
					<span className={styles.fieldPair}>
						<NumberField
							value={draft.sureFinishCount}
							min={0}
							max={null}
							isNullable={false}
							label="Fois fini, sûr"
							onCommit={(count) =>
								onChange({ ...draft, sureFinishCount: count ?? 0 })
							}
						/>
						<span className={styles.fieldUnit}>+</span>
						<NumberField
							value={draft.probableFinishCount}
							min={0}
							max={null}
							isNullable={false}
							label="Fois fini, probable"
							onCommit={(count) =>
								onChange({ ...draft, probableFinishCount: count ?? 0 })
							}
						/>
						<span className={styles.fieldUnit}>?</span>
					</span>
				</FormField>
				<FormField label="Temps relevé">
					<DurationField
						minutes={draft.trackedPlayTimeMinutes}
						label="Temps relevé"
						onCommit={(minutes) =>
							onChange({ ...draft, trackedPlayTimeMinutes: minutes })
						}
					/>
				</FormField>
				<FormField label="Temps estimé">
					<DurationField
						minutes={draft.estimatedPlayTimeMinutes}
						label="Temps estimé"
						onCommit={(minutes) =>
							onChange({ ...draft, estimatedPlayTimeMinutes: minutes })
						}
					/>
				</FormField>
				<FormField label="Note">
					<span className={styles.fieldPair}>
						<NumberField
							value={draft.rating}
							min={0}
							max={MAX_RATING}
							isNullable
							label="Note sur 20"
							digits={2}
							placeholder="–"
							onCommit={(rating) => onChange({ ...draft, rating })}
						/>
						<span className={styles.fieldUnit}>/ 20</span>
					</span>
				</FormField>
			</div>
			<div className={styles.switchRow}>
				<Checkbox
					variant="switch"
					checked={draft.isInProgress}
					label="En cours"
					onChange={() =>
						onChange({ ...draft, isInProgress: !draft.isInProgress })
					}
				/>
				<Checkbox
					variant="switch"
					checked={draft.isUpNext}
					label="À jouer bientôt"
					onChange={() => onChange({ ...draft, isUpNext: !draft.isUpNext })}
				/>
				<Checkbox
					variant="switch"
					checked={draft.isOwned}
					label="Possédé"
					onChange={() => onChange({ ...draft, isOwned: !draft.isOwned })}
				/>
			</div>
			<FormField label="Commentaire">
				<TextField
					value={draft.comment}
					label="Commentaire"
					placeholder="Une note pour plus tard…"
					onCommit={(comment) => onChange({ ...draft, comment })}
				/>
			</FormField>
			{dlcs.length > 0 && (
				<fieldset className={styles.fieldset}>
					<legend className={styles.formLabel}>DLC faits</legend>
					<ul className={styles.checkGrid}>
						{dlcs.map((dlc) => (
							<li key={dlc.id}>
								<Checkbox
									checked={draft.doneDlcIds.includes(dlc.id)}
									label={dlc.name}
									onChange={() =>
										onChange({
											...draft,
											doneDlcIds: toggleArrayItem(draft.doneDlcIds, dlc.id),
										})
									}
								/>
							</li>
						))}
					</ul>
				</fieldset>
			)}
		</div>
	);
}
