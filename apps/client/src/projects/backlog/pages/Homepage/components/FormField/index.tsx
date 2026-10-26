import type { ReactNode } from "react";

import styles from "../../../../backlog.module.scss";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";

type Props = {
	label: string;
	hint?: ReactNode;
	// Plusieurs champs (boutons radio, cases) : pas de <label>, qui ne viserait que le premier
	isGroup?: boolean;
	className?: string | undefined;
	children: ReactNode;
};

// Champ d'un formulaire de modale : son libellé au-dessus, une aide éventuelle en dessous
export function FormField({
	label,
	hint,
	isGroup = false,
	className,
	children,
}: Props) {
	const content = (
		<>
			<span className={styles.formLabel}>{label}</span>
			{children}
			{hint !== undefined && hint !== null && (
				<span className={styles.formHint}>{hint}</span>
			)}
		</>
	);
	return isGroup ? (
		<div className={joinClassNames(styles.formField, className)}>{content}</div>
	) : (
		<label className={joinClassNames(styles.formField, className)}>
			{content}
		</label>
	);
}
