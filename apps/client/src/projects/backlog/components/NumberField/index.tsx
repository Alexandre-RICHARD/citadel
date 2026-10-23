import { blurOnEnter, joinClassNames } from "../../utils";
import styles from "./numberField.module.scss";

type Props = {
	value: number | null;
	min: number;
	max: number | null;
	isNullable: boolean;
	label: string;
	onCommit: (value: number | null) => void;
	/** Champ de formulaire, ou cellule du tableau : se lit comme sa valeur, le cadre n'apparaît qu'au survol */
	variant?: "field" | "inline";
	/** Largeur du champ, en chiffres */
	digits?: number;
	placeholder?: string | undefined;
	className?: string | undefined;
};

/** Nombre entier, enregistré à la sortie du champ (ou avec Entrée) ; une valeur refusée remet le champ à la valeur enregistrée */
export function NumberField({
	value,
	min,
	max,
	isNullable,
	label,
	onCommit,
	variant = "field",
	digits = 3,
	placeholder,
	className,
}: Props) {
	return (
		<input
			key={value ?? ""}
			type="number"
			className={joinClassNames(styles.field, styles[variant], className)}
			style={{ width: `calc(${digits}ch + 1.6rem)` }}
			min={min}
			max={max ?? undefined}
			step={1}
			defaultValue={value ?? ""}
			placeholder={placeholder}
			aria-label={label}
			onKeyDown={blurOnEnter}
			onBlur={(event) => {
				const input = event.currentTarget;
				const text = input.value.trim();
				const number = text === "" ? null : Number(text);
				const isValid =
					number === null
						? isNullable
						: Number.isInteger(number) &&
							number >= min &&
							(max === null || number <= max);
				if (!isValid) {
					input.value = value === null ? "" : String(value);
				} else if (number !== value) {
					onCommit(number);
				}
			}}
		/>
	);
}
