import type { ReactNode } from "react";

import styles from "./profileSubsection.module.scss";

type Props = {
	title: string;
	lead?: ReactNode;
	children: ReactNode;
};

// Une partie d'une catégorie du profil : un sous-titre, et un trait qui la sépare de la précédente
export function ProfileSubsection({ title, lead, children }: Props) {
	return (
		<section className={styles.subsection}>
			<header>
				<h3 className={styles.title}>{title}</h3>
				{lead !== undefined && <p className={styles.lead}>{lead}</p>}
			</header>
			{children}
		</section>
	);
}
