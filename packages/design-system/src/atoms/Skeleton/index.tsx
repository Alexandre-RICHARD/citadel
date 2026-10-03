import type { ReactNode } from "react";

import styles from "./skeleton.module.scss";

type Props = {
	// Rendu réel du contenu attendu, avec des données factices : le Skeleton en fait sa silhouette
	children: ReactNode;
	// Annoncé aux lecteurs d'écran à la place de la silhouette
	label?: string;
};

// Transforme n'importe quel rendu en squelette : les textes deviennent des barres, les boutons et icônes des blocs,
// les conteneurs (cartes, bordures, espacements) restent tels quels. Aucun composant n'a besoin de sa propre variante
export function Skeleton({ children, label = "Chargement…" }: Props) {
	return (
		<div
			className={styles.skeleton}
			role="status"
		>
			<span className={styles.label}>{label}</span>
			<div
				className={styles.bones}
				aria-hidden
				inert
			>
				{children}
			</div>
		</div>
	);
}
