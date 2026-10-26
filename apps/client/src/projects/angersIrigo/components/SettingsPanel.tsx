/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./SettingsPanel.scss";

import type { JSX } from "react";

import { STALE_POSITION_SECONDS, TIME_MARKER_STEPS_MINUTES } from "../config";
import type { Settings } from "../types/settings";
import { ToggleSwitch } from "./ToggleSwitch";

const STALE_POSITION_MINUTES = STALE_POSITION_SECONDS / 60;

/** "Non", "5 min" */
function formatStep(minutes: number): string {
	return minutes === 0 ? "Non" : `${minutes} min`;
}

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
			{/* Le curseur parcourt les crans de TIME_MARKER_STEPS_MINUTES, pas des minutes */}
			<label className="settings-panel__slider">
				<span className="settings-panel__slider-header">
					<span className="settings-panel__slider-label">Repères de temps</span>
					<span className="settings-panel__slider-value">
						{formatStep(settings.timeMarkersMinutes)}
					</span>
				</span>
				<span className="settings-panel__slider-description">
					Sur le tracé d&apos;un véhicule sélectionné, où il sera dans X min
				</span>
				<input
					type="range"
					className="settings-panel__slider-input"
					min={0}
					max={TIME_MARKER_STEPS_MINUTES.length - 1}
					step={1}
					value={Math.max(
						0,
						TIME_MARKER_STEPS_MINUTES.indexOf(settings.timeMarkersMinutes),
					)}
					aria-valuetext={formatStep(settings.timeMarkersMinutes)}
					onChange={(event) =>
						onChange({
							...settings,
							timeMarkersMinutes:
								TIME_MARKER_STEPS_MINUTES[Number(event.target.value)],
						})
					}
				/>
				<span
					className="settings-panel__slider-ticks"
					aria-hidden="true"
				>
					{TIME_MARKER_STEPS_MINUTES.map((minutes) => (
						<span key={minutes}>{minutes === 0 ? "Non" : minutes}</span>
					))}
				</span>
			</label>
		</section>
	);
}
