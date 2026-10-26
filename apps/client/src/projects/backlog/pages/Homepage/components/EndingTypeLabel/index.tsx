import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";

import styles from "../../../../backlog.module.scss";
import { endingTypeIcons } from "../../../../helper/label/endingTypeIcons";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";

export function EndingTypeLabel({
	endingType,
}: {
	endingType: EndingTypeEnum;
}) {
	const Icon = endingTypeIcons[endingType];
	return (
		<span className={styles.endingType}>
			<Icon aria-hidden />
			{endingTypeLabels[endingType].label}
		</span>
	);
}
