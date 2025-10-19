import type { ChangeEvent } from "react";

type Props = {
	value: string;
	onChange: (newValue: string) => void;
};

export function InputText({ value, onChange }: Props) {
	return (
		<label htmlFor="testName">
			Nom de la nouvelle donnée
			<input
				style={{ marginInline: "0.5rem" }}
				name="testName"
				id="testName"
				type="text"
				onChange={(event: ChangeEvent<HTMLInputElement>) =>
					onChange(event.target.value)
				}
				value={value}
			/>
		</label>
	);
}
