import type { ContactAcknowledgementEnum } from "@citadel/specs/src/projects/contact/contactAcknowledgement.enum";
import { Check } from "lucide-react";

import { describeAcknowledgement } from "../../helper/describeAcknowledgement";
import styles from "./contactSuccess.module.scss";

type Props = {
	// L'adresse donnée dans le formulaire ; null : aucune
	email: string | null;
	acknowledgement: ContactAcknowledgementEnum;
	onWriteAgain: () => void;
};

// À la place du formulaire, une fois la notification partie, avec ce qu'il est advenu de l'accusé de réception
export function ContactSuccess({
	email,
	acknowledgement,
	onWriteAgain,
}: Props) {
	return (
		<div
			className={styles.success}
			role="status"
		>
			<span
				className={styles.check}
				aria-hidden
			>
				<Check />
			</span>
			<h2 className={styles.title}>Message envoyé</h2>
			<p>Merci ! Il est bien arrivé, je le lis dès que possible.</p>
			<p className={styles.detail}>
				{describeAcknowledgement(acknowledgement, email)}
			</p>
			<button
				type="button"
				className={styles.again}
				onClick={onWriteAgain}
			>
				<span data-reskin>Écrire un autre message</span>
			</button>
		</div>
	);
}
