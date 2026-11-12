import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import { useCustomizeUserGame } from "../../../../api/userGame/useCustomizeUserGame";
import { Select } from "../../../../components/Select";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { buildEndingTypeCustomization } from "../../../../helper/series/buildEndingTypeCustomization";
import { countConvertedStatuses } from "../../../../helper/status/countConvertedStatuses";
import type { TableControls } from "../../tableControls.type";
import { EndingTypeLabel } from "../EndingTypeLabel";

type Props = {
	row: BacklogRowFm;
	table: TableControls;
};

/**
 * Le type de fin du jeu ; en mode édition, une liste pour le changer. Le changement convertit les statuts devenus
 * incompatibles : s'il y en a, il se confirme d'abord
 */
export function EndingTypeCell({ row, table }: Props) {
	const customizeUserGame = useCustomizeUserGame(row.gameId);
	// Une série en cours de création n'a pas encore d'identifiant : la personnalisation ne peut pas la reprendre
	const isSeriesPending = row.series !== null && row.series.id < 0;

	if (!table.isEditMode) return <EndingTypeLabel endingType={row.endingType} />;

	return (
		<Select
			value={row.endingType}
			options={Object.values(EndingTypeEnum).map((endingType) => ({
				value: endingType,
				label: endingTypeLabels[endingType].label,
				content: <EndingTypeLabel endingType={endingType} />,
			}))}
			ariaLabel="Type de fin"
			variant="inline"
			size="sm"
			disabled={isSeriesPending}
			onChange={(endingType) => {
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
