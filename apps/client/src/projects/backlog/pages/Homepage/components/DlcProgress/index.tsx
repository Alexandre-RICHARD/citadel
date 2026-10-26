import styles from "../../../../backlog.module.scss";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { formatDlcProgress } from "../../../../helper/format/formatDlcProgress";

type Props = {
	doneCount: number;
	totalCount: number;
};

// « faits / total », avec une jauge ; complète, elle passe au vert
export function DlcProgress({ doneCount, totalCount }: Props) {
	return (
		<span
			className={joinClassNames(
				styles.dlcProgress,
				doneCount === totalCount && styles.dlcComplete,
			)}
		>
			<span className={styles.number}>
				{formatDlcProgress(doneCount, totalCount)}
			</span>
			<span
				className={styles.dlcGauge}
				aria-hidden
			>
				<span
					className={styles.dlcGaugeFill}
					style={{ width: `${(doneCount / totalCount) * 100}%` }}
				/>
			</span>
		</span>
	);
}
