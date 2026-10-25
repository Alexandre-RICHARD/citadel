import type { ReactNode } from "react";

import styles from "./stat.module.scss";

type Props = {
	label: string;
	children: ReactNode;
	mono?: boolean;
};

// Une ligne « libellé … valeur »
export function Stat({ label, children, mono = false }: Props) {
	return (
		<div className={styles.stat}>
			<span className={styles.label}>{label}</span>
			<span
				className={styles.value}
				data-mono={mono}
			>
				{children}
			</span>
		</div>
	);
}
