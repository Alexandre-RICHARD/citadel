/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./SettingsPanel.scss";

import type { JSX } from "react";

import { STALE_POSITION_SECONDS } from "../config";
import type { Settings } from "../types/settings";
import { ToggleSwitch } from "./ToggleSwitch";

const STALE_POSITION_MINUTES = STALE_POSITION_SECONDS / 60;

type SettingsPanelProps = {
	id: string;
	settings: Settings;
	onChange: (settings: Settings) => void;
};

export function SettingsPanel({
	id,
	settings,
	onChange,
}: SettingsPanelProps): JSX.Element {
	return (
		<section
			id={id}
			className="settings-panel"
			aria-labelledby={`${id}-title`}
		>
			<h2
				id={`${id}-title`}
				className="settings-panel__title"
			>
				Paramètres
			</h2>
			<ToggleSwitch
				label="Véhicules immobiles"
				description={`Sans signal depuis plus de ${STALE_POSITION_MINUTES} min`}
				checked={settings.showStaleVehicles}
				onChange={(showStaleVehicles) =>
					onChange({ ...settings, showStaleVehicles })
				}
			/>
			<ToggleSwitch
				label="Arrêts"
				description="Visibles en zoomant ; cliquez pour les prochains passages"
				checked={settings.showStops}
				onChange={(showStops) => onChange({ ...settings, showStops })}
			/>
			<ToggleSwitch
				label="Simulation des déplacements"
				description="Entre deux signaux (un par minute), fait avancer les véhicules selon les horaires prévus"
				checked={settings.simulateMovement}
				onChange={(simulateMovement) =>
					onChange({ ...settings, simulateMovement })
				}
			/>
		</section>
	);
}
