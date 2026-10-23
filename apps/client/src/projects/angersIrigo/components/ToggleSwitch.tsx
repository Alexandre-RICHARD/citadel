/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./ToggleSwitch.scss";

import type { JSX } from "react";

type ToggleSwitchProps = {
	label: string;
	description?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
};

/** Interrupteur on/off : une case à cocher native avec role="switch", stylée en interrupteur */
export function ToggleSwitch({
	label,
	description,
	checked,
	onChange,
}: ToggleSwitchProps): JSX.Element {
	return (
		<label className="toggle-switch">
			<span className="toggle-switch__text">
				<span className="toggle-switch__label">{label}</span>
				{description && (
					<span className="toggle-switch__description">{description}</span>
				)}
			</span>
			<input
				type="checkbox"
				role="switch"
				className="toggle-switch__input visually-hidden"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<span
				className="toggle-switch__track"
				aria-hidden="true"
			/>
		</label>
	);
}
