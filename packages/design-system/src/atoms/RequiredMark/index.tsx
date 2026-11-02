import styles from "./requiredMark.module.scss";

// L'astérisque rouge d'un champ requis, à droite de son libellé. Repère visuel seulement : le champ porte `required`
// (ou `aria-required`) pour les lecteurs d'écran
export function RequiredMark() {
	return (
		<span
			className={styles.requiredMark}
			aria-hidden
		>
			*
		</span>
	);
}
