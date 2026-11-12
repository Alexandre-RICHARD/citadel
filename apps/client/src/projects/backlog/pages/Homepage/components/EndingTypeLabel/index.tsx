import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";

import styles from "../../../../backlog.module.scss";
import { endingTypeIcons } from "../../../../helper/label/endingTypeIcons";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { noEndingTypeLabel } from "../../../../helper/label/noEndingTypeLabel";

// null : pas de type de fin, estompé
export function EndingTypeLabel({
	endingType,
}: {
	endingType: EndingTypeEnum | null;
}) {
	if (endingType === null)
		return (
			<span className={joinClassNames(styles.endingType, styles.zeroValue)}>
				{noEndingTypeLabel.label}
			</span>
		);
	const Icon = endingTypeIcons[endingType];
	return (
		<span className={styles.endingType}>
			<Icon aria-hidden />
			{endingTypeLabels[endingType].label}
		</span>
	);
}
