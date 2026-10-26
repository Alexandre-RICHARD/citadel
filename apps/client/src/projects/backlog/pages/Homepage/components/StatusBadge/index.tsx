import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import {
	BadgeCheck,
	Ban,
	CircleCheck,
	CircleDashed,
	Crown,
	Eye,
	Flag,
	Gauge,
	type LucideIcon,
	Play,
	Trophy,
} from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { statusLabels } from "../../../../helper/label/statusLabels";

// Icône et teinte de chaque statut : du gris (pas commencé) à l'or (complété et platiné), rouge pour abandonné
const statusAppearances: Readonly<
	Record<StatusEnum, { icon: LucideIcon; tone: string | undefined }>
> = {
	[StatusEnum.NOT_STARTED]: { icon: CircleDashed, tone: styles.toneGray },
	[StatusEnum.WATCHED]: { icon: Eye, tone: styles.toneViolet },
	[StatusEnum.STARTED]: { icon: Play, tone: styles.toneBlue },
	[StatusEnum.WELL_UNDERWAY]: { icon: Gauge, tone: styles.toneCyan },
	[StatusEnum.FINISHED]: { icon: Flag, tone: styles.toneGreen },
	[StatusEnum.DEEMED_FINISHED]: { icon: CircleCheck, tone: styles.toneGreen },
	[StatusEnum.COMPLETED]: { icon: BadgeCheck, tone: styles.toneTeal },
	[StatusEnum.PLATINUM]: { icon: Trophy, tone: styles.toneIndigo },
	[StatusEnum.COMPLETED_AND_PLATINUM]: { icon: Crown, tone: styles.toneAmber },
	[StatusEnum.ABANDONED]: { icon: Ban, tone: styles.toneRed },
};

export function StatusBadge({ status }: { status: StatusEnum }) {
	const { icon: Icon, tone } = statusAppearances[status];
	return (
		<span className={joinClassNames(styles.badge, tone)}>
			<Icon aria-hidden />
			{statusLabels[status].label}
		</span>
	);
}
