import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { isFinishedStatus } from "@citadel/specs/src/projects/backlog/helper/status/isFinishedStatus";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import { useCustomizeUserGame } from "../../../../api/userGame/useCustomizeUserGame";
import { Select } from "../../../../components/Select";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { NO_ENDING_TYPE } from "../../../../helper/label/noEndingType";
import { noEndingTypeLabel } from "../../../../helper/label/noEndingTypeLabel";
import { buildEndingTypeCustomization } from "../../../../helper/series/buildEndingTypeCustomization";
import type { TableControls } from "../../tableControls.type";
import { EndingTypeLabel } from "../EndingTypeLabel";

type Props = {
	row: BacklogRowFm;
	table: TableControls;
};

/**
 * Le type de fin du jeu, s'il en a un ; en mode édition, une liste pour le changer. Il ne se retire pas tant qu'une
 * version jouée a un statut de fin
 */
export function EndingTypeCell({ row, table }: Props) {
	const customizeUserGame = useCustomizeUserGame(row.gameId);
	// Une série en cours de création n'a pas encore d'identifiant : la personnalisation ne peut pas la reprendre
	const isSeriesPending = row.series !== null && row.series.id < 0;
	const hasFinishedStatus = row.userVersionRows.some(({ status }) =>
		isFinishedStatus(status),
	);

	if (!table.isEditMode)
		return row.endingType === null ? null : (
			<EndingTypeLabel endingType={row.endingType} />
		);

	return (
		<Select<EndingTypeEnum | typeof NO_ENDING_TYPE>
			value={row.endingType ?? NO_ENDING_TYPE}
			options={[
				{
					value: NO_ENDING_TYPE,
					label: noEndingTypeLabel.label,
					content: <EndingTypeLabel endingType={null} />,
					disabled: hasFinishedStatus,
					hint: hasFinishedStatus ? "un statut de fin l'exige" : undefined,
				},
				...Object.values(EndingTypeEnum).map((endingType) => ({
					value: endingType,
					label: endingTypeLabels[endingType].label,
					content: <EndingTypeLabel endingType={endingType} />,
				})),
			]}
			ariaLabel="Type de fin"
			variant="inline"
			size="sm"
			disabled={isSeriesPending}
			onChange={(choice) =>
				customizeUserGame.mutate(
					buildEndingTypeCustomization(
						row,
						choice === NO_ENDING_TYPE ? null : choice,
					),
				)
			}
		/>
	);
}
