import type { IconComponent } from "@citadel/design-system/src/types/iconComponent.type";
import type { ReactNode } from "react";

import type { StatusTone } from "../../status/statusTone.type";
import { StatusDot } from "../StatusDot";
import styles from "./card.module.scss";

type Props = {
	title: string;
	icon: IconComponent;
	// Pastille d'état à droite du titre, avec son texte
	status?: { tone: StatusTone; text: string };
	// Message d'erreur de la dernière lecture : les données d'avant restent affichées
	error?: string | null;
	children: ReactNode;
};

export function Card({ title, icon: Icon, status, error, children }: Props) {
	return (
		<section
			className={styles.card}
			aria-label={title}
		>
			<header className={styles.header}>
				<span className={styles.icon}>
					<Icon
						size={16}
						strokeWidth={2.25}
					/>
				</span>
				<h2 className={styles.title}>{title}</h2>
				{status ? (
					<span className={styles.status}>
						<StatusDot
							tone={status.tone}
							label={status.text}
						/>
						{status.text}
					</span>
				) : null}
			</header>
			{error ? <p className={styles.error}>{error}</p> : null}
			<div className={styles.body}>{children}</div>
		</section>
	);
}
