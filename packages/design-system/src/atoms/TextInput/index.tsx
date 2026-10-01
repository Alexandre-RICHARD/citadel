import { type ChangeEvent, useId } from "react";

import styles from "./textInput.module.scss";

type Props = {
	id?: string;
	label: string;
	value: string;
	onChange: (newValue: string) => void;
};

export function TextInput({ id, label, value, onChange }: Props) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.target.value);
	}

	return (
		<label
			className={styles.inputTextContainer}
			htmlFor={inputId}
		>
			{label}
			<input
				className={styles.inputText}
				name={inputId}
				id={inputId}
				type="text"
				onChange={handleChange}
				value={value}
			/>
		</label>
	);
}
