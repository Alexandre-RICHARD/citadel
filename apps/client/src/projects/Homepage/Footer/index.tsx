import styles from "./footer.module.scss";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className={styles.footer}>
			<span className={styles.footerName}>RICHARD Alexandre</span>
			<span className={styles.separator}>—</span>
			Tous droits réservés © {currentYear}
		</footer>
	);
}
