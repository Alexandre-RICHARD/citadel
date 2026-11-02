import { RequiredMark } from "@citadel/design-system/src/atoms/RequiredMark";
import type { ReactNode } from "react";

import styles from "./formField.module.scss";

type Props = {
	label: string;
	// L'id du champ que le libellé désigne
	htmlFor: string;
	isRequired?: boolean;
	// À droite du libellé : un bouton lié au champ (« Vérifier la disponibilité »)
	aside?: ReactNode;
	// Sous le champ : une aide, une barre de force, un résultat
	children: ReactNode;
};

// Un champ et son libellé, l'astérisque rouge s'il est requis
export function FormField({
	label,
	htmlFor,
	isRequired = false,
	aside,
	children,
}: Props) {
	return (
		<div className={styles.field}>
			<div className={styles.header}>
				<label
					className={styles.label}
					htmlFor={htmlFor}
				>
					{label}
					{isRequired && <RequiredMark />}
				</label>
				{aside}
			</div>
			{children}
		</div>
	);
}
