import styles from "./pageLoading.module.scss";

// Le temps de savoir où en est le navigateur (session, parcours en cours) : une carte vide, sans clignoter sur un
// chargement local de quelques millisecondes
export function PageLoading() {
	return (
		<div
			className={styles.loading}
			role="status"
			aria-label="Chargement"
		/>
	);
}
