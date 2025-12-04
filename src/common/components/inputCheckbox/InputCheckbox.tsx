import type { ChangeEvent } from "react";

import { generateUuid } from "../../helpers/uuid/generateUuid";
import styles from "./inputCheckbox.module.scss";

type Props = {
	id?: string;
	label: string;
	value: boolean;
	onChange: (newValue: boolean) => void;
};

export function InputCheckbox({ id, label, value, onChange }: Props) {
	const uuid = generateUuid();

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.target.checked);
	}

	return (
		<label
			className={styles.inputCheckboxContainer}
			htmlFor={id ?? uuid}
		>
			{label}
			<input
				className={styles.inputCheckbox}
				name={id ?? uuid}
				id={id ?? uuid}
				type="checkbox"
				onChange={handleChange}
				checked={value}
			/>
		</label>
	);
}
