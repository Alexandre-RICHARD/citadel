import { ConsoleBanner } from "./ConsoleBanner";
import { MailQuotaBanner } from "./MailQuotaBanner";
import styles from "./siteBanner.module.scss";

// Les bandeaux du site, sur tous les projets, empilés : le message de la console (ou l'avis après une restauration),
// et la fermeture du formulaire de contact par le quota d'emails
export function SiteBanner() {
	return (
		<div className={styles.stack}>
			<ConsoleBanner />
			<MailQuotaBanner />
		</div>
	);
}
