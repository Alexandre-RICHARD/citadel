import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import type { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";

import styles from "../../../../backlog.module.scss";
import { getStatusLabel } from "../../../../helper/status/getStatusLabel";
import { statusDescriptions } from "../../../../helper/status/statusDescriptions";

type Props = {
	status: StatusEnum;
	// Le type de fin du jeu, qui décide du libellé (« Fini » ou « Estimé fini ») ; sans jeu en face, les deux libellés
	endingType?: EndingTypeEnum | null;
};

export function StatusBadge({ status, endingType }: Props) {
	const { icon: Icon, tone } = statusDescriptions[status];
	return (
		<span className={joinClassNames(styles.badge, tone)}>
			<Icon aria-hidden />
			{getStatusLabel(status, endingType)}
		</span>
	);
}
