import type { ReactNode } from "react";

import styles from "../../../../backlog.module.scss";

type Props = {
	// Compteur à droite du titre, ex. « 2 / 5 »
	count?: string | undefined;
	children: ReactNode;
};

// Titre d'une section de modale
export function SectionTitle({ count, children }: Props) {
	return (
		<h3 className={styles.sectionTitle}>
			{children}
			{count !== undefined && (
				<span className={styles.sectionCount}>{count}</span>
			)}
		</h3>
	);
}
