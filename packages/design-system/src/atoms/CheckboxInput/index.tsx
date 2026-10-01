import { type ChangeEvent, useId } from "react";

import styles from "./checkboxInput.module.scss";

type Props = {
	id?: string;
	label: string;
	value: boolean;
	onChange: (newValue: boolean) => void;
};

export function CheckboxInput({ id, label, value, onChange }: Props) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.target.checked);
	}

	return (
		<label
			className={styles.inputCheckboxContainer}
			htmlFor={inputId}
		>
			{label}
			<input
				className={styles.inputCheckbox}
				name={inputId}
				id={inputId}
				type="checkbox"
				onChange={handleChange}
				checked={value}
			/>
		</label>
	);
}
