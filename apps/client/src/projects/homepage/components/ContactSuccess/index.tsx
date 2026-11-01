import { Check } from "lucide-react";

import styles from "./contactSuccess.module.scss";

type Props = {
	// L'adresse donnée dans le formulaire ; null : aucune
	email: string | null;
	onWriteAgain: () => void;
};

// À la place du formulaire, une fois la notification partie
export function ContactSuccess({ email, onWriteAgain }: Props) {
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
				{email === null
					? "Sans adresse, je ne pourrai pas vous répondre."
					: `Un accusé de réception part vers ${email}, sauf si vous en avez déjà reçu un aujourd’hui.`}
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
