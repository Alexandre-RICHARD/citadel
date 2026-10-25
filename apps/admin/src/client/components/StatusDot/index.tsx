import type { StatusTone } from "../../status/statusTone.type";
import styles from "./statusDot.module.scss";

type Props = {
	tone: StatusTone;
	// Annoncé aux lecteurs d'écran ; la couleur seule ne dit rien à tout le monde
	label: string;
};

export function StatusDot({ tone, label }: Props) {
	return (
		<span
			className={styles.statusDot}
			data-tone={tone}
			role="img"
			aria-label={label}
			title={label}
		/>
	);
}
