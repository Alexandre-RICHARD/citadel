import { type ChangeEvent, useId } from "react";

import styles from "./rangeInput.module.scss";

type Props = {
	id?: string;
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	unit?: string;
	onChange: (newValue: number) => void;
};

export function RangeInput({
	id,
	label,
	value,
	min,
	max,
	step,
	unit,
	onChange,
}: Props) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange(event.target.valueAsNumber);
	}

	return (
		<label
			htmlFor={inputId}
			className={styles.range_input_container}
		>
			{label}
			<div className={styles.range_slider_container}>
				<input
					className={styles.range_input}
					name={inputId}
					id={inputId}
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={handleChange}
				/>
				<p className={styles.range_slider_value}>
					{unit ? `${value} ${unit}` : value}
				</p>
			</div>
		</label>
	);
}
