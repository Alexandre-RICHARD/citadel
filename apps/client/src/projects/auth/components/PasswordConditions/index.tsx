import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths";
import { Check, Circle } from "lucide-react";

import { checkPasswordLength } from "../../helper/password/checkPasswordLength";
import styles from "./passwordConditions.module.scss";

type Props = {
	id: string;
	password: string;
};

// Les conditions du mot de passe, qui passent au vert pendant la frappe : seule la longueur compte
export function PasswordConditions({ id, password }: Props) {
	const { hasMinLength, hasMaxLength } = checkPasswordLength(password);
	const conditions = [
		{
			key: "min",
			label: `Au moins ${AUTH_FIELD_LENGTHS.passwordMin} caractères`,
			isMet: hasMinLength,
		},
		{
			key: "max",
			label: `Au plus ${AUTH_FIELD_LENGTHS.passwordMax} caractères`,
			isMet: hasMaxLength,
		},
	];

	return (
		<ul
			id={id}
			className={styles.conditions}
			aria-label="Conditions du mot de passe"
		>
			{conditions.map(({ key, label, isMet }) => (
				<li
					key={key}
					className={styles.condition}
					data-met={isMet}
				>
					{isMet ? <Check aria-hidden /> : <Circle aria-hidden />}
					{label}
					<span className={styles.status}>
						{isMet ? " (respectée)" : " (pas encore)"}
					</span>
				</li>
			))}
		</ul>
	);
}
