import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
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
import { statusLabels } from "../../../../helper/label/statusLabels";

// Icône et teinte de chaque statut : gris pour pas commencé, bleu puis vert d'eau pour les statuts en cours, du rouge
// à l'or pour les statuts de fin (plus c'est loin, plus c'est doré), violet pour abandonné, hors échelle
const statusAppearances: Readonly<
	Record<StatusEnum, { icon: LucideIcon; tone: string | undefined }>
> = {
	[StatusEnum.NOT_STARTED]: { icon: CircleDashed, tone: styles.toneGray },
	[StatusEnum.WATCHED]: { icon: Eye, tone: styles.toneRed },
	[StatusEnum.STARTED]: { icon: Play, tone: styles.toneBlue },
	[StatusEnum.WELL_UNDERWAY]: { icon: Gauge, tone: styles.toneTeal },
	[StatusEnum.FINISHED]: { icon: Flag, tone: styles.toneOrange },
	[StatusEnum.DEEMED_FINISHED]: { icon: CircleCheck, tone: styles.toneOrange },
	[StatusEnum.COMPLETED]: { icon: BadgeCheck, tone: styles.toneAmber },
	[StatusEnum.PLATINUM]: { icon: Trophy, tone: styles.toneYellow },
	[StatusEnum.COMPLETED_AND_PLATINUM]: { icon: Crown, tone: styles.toneGold },
	[StatusEnum.ABANDONED]: { icon: Ban, tone: styles.toneViolet },
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
