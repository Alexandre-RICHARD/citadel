import { CircleHelp } from "lucide-react";
import { useId } from "react";

import { computePasswordStrength } from "../../helper/password/computePasswordStrength";
import { PasswordStrengthEnum } from "../../helper/password/passwordStrength.enum";
import styles from "./passwordStrengthMeter.module.scss";

type Props = {
	password: string;
};

const STRENGTH_LABELS: Record<PasswordStrengthEnum, string> = {
	[PasswordStrengthEnum.VERY_WEAK]: "Très faible",
	[PasswordStrengthEnum.WEAK]: "Faible",
	[PasswordStrengthEnum.FAIR]: "Moyen",
	[PasswordStrengthEnum.GOOD]: "Bon",
	[PasswordStrengthEnum.EXCELLENT]: "Excellent",
};
const SEGMENTS = [
	PasswordStrengthEnum.WEAK,
	PasswordStrengthEnum.FAIR,
	PasswordStrengthEnum.GOOD,
	PasswordStrengthEnum.EXCELLENT,
];

// La force du mot de passe en quatre segments, indicative : rien n'est refusé pour elle. Le « ? » dit sa limite
export function PasswordStrengthMeter({ password }: Props) {
	const helpId = useId();
	const strength = computePasswordStrength(password);
	const isEmpty = password === "";

	return (
		<div className={styles.meter}>
			<div
				className={styles.bar}
				data-strength={isEmpty ? "empty" : strength}
				aria-hidden
			>
				{SEGMENTS.map((segment) => (
					<span
						key={segment}
						className={styles.segment}
						data-filled={!isEmpty && strength >= segment}
					/>
				))}
			</div>
			<div className={styles.legend}>
				<span
					className={styles.label}
					aria-live="polite"
				>
					{isEmpty
						? "Force du mot de passe"
						: `Force : ${STRENGTH_LABELS[strength]}`}
				</span>
				<details className={styles.help}>
					<summary
						className={styles.helpToggle}
						aria-label="Comment la force est-elle estimée ?"
						aria-describedby={helpId}
					>
						<CircleHelp aria-hidden />
					</summary>
					<p
						id={helpId}
						className={styles.helpText}
					>
						Une estimation faite dans votre navigateur : longueur, variété des
						caractères, répétitions (aaaa), suites (1234, abcd) et rangées du
						clavier (azerty). Elle ne connaît aucun dictionnaire : un mot
						courant maquillé, comme « P@ssw0rd! », paraît plus solide qu’il ne
						l’est. Une phrase de plusieurs mots vaut mieux.
					</p>
				</details>
			</div>
		</div>
	);
}
