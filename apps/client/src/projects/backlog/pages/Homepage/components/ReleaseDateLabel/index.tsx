import { Ban, CalendarClock } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { formatReleaseDate } from "../../../../helper/format/formatReleaseDate";

// Libellé de `formatReleaseDate` sans date : « à venir »
const UPCOMING_RELEASE_LABEL = formatReleaseDate(null, false);

type Props = {
	date: string | null;
	isCancelled: boolean;
};

// Date de sortie (cahier des charges, §7) : la date, ou une pastille « à venir » ou « annulé »
export function ReleaseDateLabel({ date, isCancelled }: Props) {
	const label = formatReleaseDate(date, isCancelled);
	if (isCancelled)
		return (
			<span className={joinClassNames(styles.badge, styles.toneRed)}>
				<Ban aria-hidden />
				{label}
			</span>
		);
	if (label === UPCOMING_RELEASE_LABEL)
		return (
			<span className={joinClassNames(styles.badge, styles.toneViolet)}>
				<CalendarClock aria-hidden />
				{label}
			</span>
		);
	return <span className={styles.number}>{label}</span>;
}
