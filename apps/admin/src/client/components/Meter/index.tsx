import { meterTone } from "../../status/meterTone";
import styles from "./meter.module.scss";

type Props = {
	label: string;
	// Entre 0 et 1 ; null : pas encore mesuré
	ratio: number | null;
	valueText: string;
	compact?: boolean;
};

export function Meter({ label, ratio, valueText, compact = false }: Props) {
	const clamped = ratio === null ? 0 : Math.min(1, Math.max(0, ratio));
	return (
		<div
			className={styles.meter}
			data-compact={compact}
		>
			{compact ? null : (
				<div className={styles.header}>
					<span className={styles.label}>{label}</span>
					<span className={styles.value}>{valueText}</span>
				</div>
			)}
			<div
				className={styles.track}
				role="meter"
				aria-label={label}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(clamped * 100)}
				aria-valuetext={valueText}
				title={compact ? `${label} : ${valueText}` : undefined}
			>
				<div
					className={styles.fill}
					data-tone={meterTone(clamped)}
					style={{ width: `${clamped * 100}%` }}
				/>
			</div>
		</div>
	);
}
