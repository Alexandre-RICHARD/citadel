import type { IconComponent } from "../../types/iconComponent.type";
import styles from "./countBadge.module.scss";

type Props = {
	count: number;
	icon: IconComponent;
	size?: "sm" | "md";
	variant?: "accent" | "neutral";
	flickerIcon?: boolean;
};

export function CountBadge({
	count,
	icon: Icon,
	size = "md",
	variant = "accent",
	flickerIcon = false,
}: Props) {
	return (
		<div
			className={styles.countBadge}
			data-variant={variant}
			data-size={size}
		>
			<Icon
				size={size === "sm" ? 13 : 15}
				strokeWidth={2.4}
				className={`${styles.icon} ${flickerIcon ? styles.flickering : ""}`}
			/>
			<span className={styles.count}>{count}</span>
		</div>
	);
}
