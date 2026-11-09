import { Clock } from "lucide-react";
import { useState } from "react";

import styles from "../../../../backlog.module.scss";
import { formatDuration } from "../../../../helper/format/formatDuration";
import { getNextPlayTimeView } from "../../../../helper/overview/getNextPlayTimeView";
import { getPlayTimeMinutes } from "../../../../helper/overview/getPlayTimeMinutes";
import { PlayTimeViewEnum } from "../../../../helper/overview/playTimeView.enum";
import { playTimeViewLabels } from "../../../../helper/overview/playTimeViewLabels";

type Props = {
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
};

// Le temps de jeu du backlog : un clic passe de la somme au temps relevé, puis à l'estimé
export function PlayTimeRecap(playTimes: Props) {
	const [view, setView] = useState(PlayTimeViewEnum.TOTAL);
	const nextView = getNextPlayTimeView(view);

	return (
		<button
			type="button"
			className={styles.captionToggle}
			title={`Temps de jeu ${playTimeViewLabels[view]} : cliquer pour voir le temps ${playTimeViewLabels[nextView]}`}
			onClick={() => setView(nextView)}
		>
			<Clock aria-hidden />
			<strong>{formatDuration(getPlayTimeMinutes(playTimes, view))}</strong>
			<span className={styles.captionToggleLabel}>
				{playTimeViewLabels[view]}
			</span>
		</button>
	);
}
