import { formatCount } from "../../format/formatCount";
import { formatDelta } from "../../format/formatDelta";
import { deltaTone } from "../../status/deltaTone";
import styles from "./reportTile.module.scss";

type Props = {
	label: string;
	value: number;
	previous: number | null;
	// Le sens où le chiffre s'améliore, pour la couleur de l'écart
	better: "up" | "down" | "none";
	detail: string;
	// À la place de l'écart : « cette semaine » pour cross-seed
	note?: string;
};

// Un chiffre du rapport, son écart avec le passage précédent, et une ligne de détail
export function ReportTile({
	label,
	value,
	previous,
	better,
	detail,
	note,
}: Props) {
	const delta = formatDelta(value, previous);
	return (
		<div className={styles.tile}>
			<span className={styles.label}>{label}</span>
			<span className={styles.value}>
				{formatCount(value)}
				{delta === null ? null : (
					<span
						className={styles.badge}
						data-tone={deltaTone(value, previous, better)}
					>
						{delta}
					</span>
				)}
				{note === undefined ? null : (
					<span
						className={styles.badge}
						data-tone="accent"
					>
						{note}
					</span>
				)}
			</span>
			<span
				className={styles.detail}
				title={detail}
			>
				{detail}
			</span>
		</div>
	);
}
