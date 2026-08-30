import { Flame } from "lucide-react";

import globalStyles from "../../../../globalStyles.module.scss";
import styles from "./count.module.scss";

type Props = {
	count: number;
	size?: "sm" | "md";
	variant?: "standard" | "dark";
};

export function Count({ count, size = "md", variant = "standard" }: Props) {
	return (
		<div
			className={`${styles.emberBadge} ${styles[`emberBadge${size}`]}`}
			data-variant={variant}
		>
			<Flame
				size={size === "sm" ? 13 : 15}
				strokeWidth={2.4}
				className={styles.emberFlame}
			/>
			<span className={globalStyles.mono}>{count}</span>
		</div>
	);
}
