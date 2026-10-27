import styles from "./progressRing.module.scss";

type Props = {
	// Avancement, en pourcentage
	value: number;
};

// L'avancement d'un projet, en anneau, sur sa boîte de la roue
export function ProgressRing({ value }: Props) {
	return (
		<span
			className={styles.progressRing}
			title={`Avancement : ${value} %`}
		>
			<svg
				viewBox="0 0 24 24"
				aria-hidden
			>
				<circle
					className={styles.track}
					cx="12"
					cy="12"
					r="9"
				/>
				<circle
					className={styles.value}
					cx="12"
					cy="12"
					r="9"
					pathLength="100"
					strokeDasharray={`${value} 100`}
					transform="rotate(-90 12 12)"
				/>
			</svg>
			<b>{value}&#8239;%</b>
		</span>
	);
}
