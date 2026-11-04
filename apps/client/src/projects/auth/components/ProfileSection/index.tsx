import type { ReactNode } from "react";

import styles from "./profileSection.module.scss";

type Props = {
	// Une icône lucide, à côté du titre
	icon: ReactNode;
	title: string;
	lead?: ReactNode;
	children: ReactNode;
};

// Une partie du profil : un titre et ce qu'on peut y faire, sur une carte comme celles des autres pages du compte
export function ProfileSection({ icon, title, lead, children }: Props) {
	return (
		<section className={styles.section}>
			<header className={styles.header}>
				<span
					className={styles.icon}
					aria-hidden
				>
					{icon}
				</span>
				<div>
					<h2 className={styles.title}>{title}</h2>
					{lead !== undefined && <p className={styles.lead}>{lead}</p>}
				</div>
			</header>
			<div className={styles.body}>{children}</div>
		</section>
	);
}
