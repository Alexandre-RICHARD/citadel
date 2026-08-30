import type { ChangeEvent } from "react";

import { generateUuid } from "../../../../helpers/uuid/generateUuid.ts";
import styles from "./textInput.module.scss";

type Props = {
	id?: string;
	label: string;
	value: string;
	onChange: (newValue: string) => void;
};

export function TextInput({ id, label, value, onChange }: Props) {
	const uuid = generateUuid();

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.target.value);
	}

	return (
		<label
			className={styles.inputTextContainer}
			htmlFor={id ?? uuid}
		>
			{label}
			<input
				className={styles.inputText}
				name={id ?? uuid}
				id={id ?? uuid}
				type="text"
				onChange={handleChange}
				value={value}
			/>
		</label>
	);
}
