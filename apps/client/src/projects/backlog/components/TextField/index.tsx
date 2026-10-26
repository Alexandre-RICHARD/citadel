import { trimToNull } from "@citadel/common/src/universal/string/trimToNull";

import { blurOnEnter } from "../../helper/dom/blurOnEnter";
import { joinClassNames } from "../../helper/dom/joinClassNames";
import styles from "./textField.module.scss";

type Props = {
	value: string | null;
	label: string;
	onCommit: (value: string | null) => void;
	/** Champ de formulaire, ou cellule du tableau : se lit comme sa valeur, le cadre n'apparaît qu'au survol */
	variant?: "field" | "inline";
	placeholder?: string | undefined;
	className?: string | undefined;
};

/** Texte libre, enregistré à la sortie du champ (ou avec Entrée) ; vide, il vaut `null` */
export function TextField({
	value,
	label,
	onCommit,
	variant = "field",
	placeholder,
	className,
}: Props) {
	return (
		<input
			key={value ?? ""}
			type="text"
			className={joinClassNames(styles.field, styles[variant], className)}
			defaultValue={value ?? ""}
			placeholder={placeholder}
			aria-label={label}
			onKeyDown={blurOnEnter}
			onBlur={(event) => {
				const text = trimToNull(event.currentTarget.value);
				if (text !== value) {
					onCommit(text);
				}
			}}
		/>
	);
}
