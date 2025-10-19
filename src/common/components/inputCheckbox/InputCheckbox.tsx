import type { ChangeEvent } from "react";

type Props = {
	value: boolean;
	onChange: (newValue: boolean) => void;
};

export function InputCheckbox({ value, onChange }: Props) {
	return (
		<label htmlFor="testIsActive">
			Etat de l utilisateur
			<input
				style={{ marginInline: "0.5rem" }}
				name="testIsActive"
				id="testIsActive"
				type="checkbox"
				onChange={(event: ChangeEvent<HTMLInputElement>) => {
					onChange(event.target.checked);
				}}
				checked={value}
			/>
		</label>
	);
}
