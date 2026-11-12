import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { isFinishedStatus } from "@citadel/specs/src/projects/backlog/helper/status/isFinishedStatus";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import { useCustomizeUserGame } from "../../../../api/userGame/useCustomizeUserGame";
import { Select } from "../../../../components/Select";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { NO_ENDING_TYPE } from "../../../../helper/label/noEndingType";
import { noEndingTypeLabel } from "../../../../helper/label/noEndingTypeLabel";
import { buildEndingTypeCustomization } from "../../../../helper/series/buildEndingTypeCustomization";
import { countConvertedStatuses } from "../../../../helper/status/countConvertedStatuses";
import type { TableControls } from "../../tableControls.type";
import { EndingTypeLabel } from "../EndingTypeLabel";

type Props = {
	row: BacklogRowFm;
	table: TableControls;
};

/**
 * Le type de fin du jeu, s'il en a un ; en mode édition, une liste pour le changer. Le changement convertit les
 * statuts devenus incompatibles : s'il y en a, il se confirme d'abord. Il ne se retire pas tant qu'une version jouée a
 * un statut de fin
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
				...Object.values(EndingTypeEnum).map((endingType) => ({
					value: endingType,
					label: endingTypeLabels[endingType].label,
					content: <EndingTypeLabel endingType={endingType} />,
				})),
				{
					value: NO_ENDING_TYPE,
					label: noEndingTypeLabel.label,
					content: <EndingTypeLabel endingType={null} />,
					disabled: hasFinishedStatus,
					hint: hasFinishedStatus ? "un statut de fin l'exige" : undefined,
				},
			]}
			ariaLabel="Type de fin"
			variant="inline"
			size="sm"
			disabled={isSeriesPending}
			onChange={(choice) => {
				const endingType = choice === NO_ENDING_TYPE ? null : choice;
				const customization = buildEndingTypeCustomization(row, endingType);
				const convertedStatusCount = countConvertedStatuses(
					row.userVersionRows.map(({ status }) => status),
					endingType,
				);
				if (convertedStatusCount === 0) customizeUserGame.mutate(customization);
				else
					table.openModal({
						kind: "confirmEndingType",
						gameId: row.gameId,
						gameName: row.frenchName ?? row.name,
						customization,
						convertedStatusCount,
					});
			}}
		/>
	);
}
