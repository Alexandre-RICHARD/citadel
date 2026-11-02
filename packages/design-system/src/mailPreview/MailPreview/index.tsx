import { NOREPLY_ADDRESS } from "@citadel/server/src/mail/address/noreplyAddress.ts";
import type { Mail } from "@citadel/server/src/mail/mail.type.ts";
import type { MailAddress } from "@citadel/server/src/mail/mailAddress.type.ts";

import styles from "./mailPreview.module.scss";

type Props = {
	mail: Mail;
};

function formatAddress({ email, name }: MailAddress): string {
	return name === null ? email : `${name} <${email}>`;
}

// Un mail comme le reçoit un destinataire : ses en-têtes, son HTML (dans un cadre isolé : aucun script, aucun style
// du site) et sa version en texte brut, que les clients mail affichent quand le HTML est refusé
export function MailPreview({ mail }: Props) {
	return (
		<div className={styles.preview}>
			<dl className={styles.headers}>
				<dt>De</dt>
				<dd>{formatAddress(NOREPLY_ADDRESS)}</dd>
				<dt>À</dt>
				<dd>{formatAddress(mail.to)}</dd>
				{mail.replyTo !== null && (
					<>
						<dt>Répondre à</dt>
						<dd>{formatAddress(mail.replyTo)}</dd>
					</>
				)}
				<dt>Objet</dt>
				<dd className={styles.subject}>{mail.subject}</dd>
			</dl>
			<div className={styles.panes}>
				<section className={styles.pane}>
					<h2 className={styles.paneTitle}>HTML</h2>
					<iframe
						className={styles.frame}
						title="Version HTML du mail"
						sandbox=""
						srcDoc={mail.html}
					/>
				</section>
				<section className={styles.pane}>
					<h2 className={styles.paneTitle}>Texte brut</h2>
					<pre className={styles.text}>{mail.text}</pre>
				</section>
			</div>
		</div>
	);
}
