/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./VehicleFilterControl.scss";

import type { JSX } from "react";

import type { VehicleFilter } from "../types/vehicle";

const FILTER_OPTIONS: { value: VehicleFilter; label: string }[] = [
	{ value: "all", label: "Tous" },
	{ value: "tram", label: "Trams" },
	{ value: "bus", label: "Bus" },
];

type VehicleFilterControlProps = {
	value: VehicleFilter;
	counts: Record<VehicleFilter, number>;
	onChange: (filter: VehicleFilter) => void;
};

/** Choix exclusif entre Tous / Trams / Bus, chaque option affichant son nombre de véhicules */
export function VehicleFilterControl({
	value,
	counts,
	onChange,
}: VehicleFilterControlProps): JSX.Element {
	return (
		// Boutons radio natifs, masqués visuellement : navigation clavier et lecteurs d'écran fonctionnent d'office
		<fieldset className="vehicle-filter">
			<legend className="visually-hidden">Véhicules affichés</legend>
			{FILTER_OPTIONS.map((option) => (
				<label
					key={option.value}
					className="vehicle-filter__option"
				>
					<input
						type="radio"
						name="vehicle-filter"
						className="visually-hidden"
						value={option.value}
						checked={value === option.value}
						onChange={() => onChange(option.value)}
					/>
					<span className="vehicle-filter__label">{option.label}</span>
					<span className="vehicle-filter__count">{counts[option.value]}</span>
				</label>
			))}
		</fieldset>
	);
}
