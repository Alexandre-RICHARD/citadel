import type { ReactNode } from "react";

import styles from "./authCard.module.scss";

type Props = {
	// Une icône lucide, dans la pastille au-dessus du titre
	icon: ReactNode;
	title: string;
	lead?: ReactNode;
	children: ReactNode;
	// Sous la carte : les liens vers les autres pages du compte
	footer?: ReactNode;
};

// La carte d'une page du compte : pastille, titre, phrase d'accroche, puis le formulaire ou l'étape en cours
export function AuthCard({ icon, title, lead, children, footer }: Props) {
	return (
		<section className={styles.wrapper}>
			<div className={styles.card}>
				<span
					className={styles.badge}
					aria-hidden
				>
					{icon}
				</span>
				<h1 className={styles.title}>{title}</h1>
				{lead !== undefined && <p className={styles.lead}>{lead}</p>}
				<div className={styles.body}>{children}</div>
			</div>
			{footer !== undefined && <div className={styles.footer}>{footer}</div>}
		</section>
	);
}
