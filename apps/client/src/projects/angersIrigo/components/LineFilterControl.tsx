/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./LineFilterControl.scss";

import { type JSX, useId, useState } from "react";

import { GTFS_STATIC } from "../data/gtfs-static";
import type { Vehicle } from "../types/vehicle";
import { getLineOptions } from "../utils/vehicles";
import { LineBadge } from "./LineBadge";

function ChevronIcon(): JSX.Element {
	return (
		<svg
			className="line-filter__chevron"
			viewBox="0 0 24 24"
			width="16"
			height="16"
			aria-hidden="true"
		>
			<path
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				d="M6 9l6 6 6-6"
			/>
		</svg>
	);
}

type LineFilterControlProps = {
	/** Véhicules affichables du mode choisi (Tous / Trams / Bus) : leurs lignes sont proposées */
	vehicles: Vehicle[];
	/** Lignes choisies ; aucune = toutes les lignes */
	selectedRouteIds: string[];
	onChange: (routeIds: string[]) => void;
};

/**
 * Choix des lignes affichées, replié par défaut : une pastille par ligne en circulation, avec
 * son nombre de véhicules. Sans ligne choisie, toutes s'affichent ; sinon, seulement celles-là.
 */
export function LineFilterControl({
	vehicles,
	selectedRouteIds,
	onChange,
}: LineFilterControlProps): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const optionsId = useId();
	const options = getLineOptions(
		vehicles,
		selectedRouteIds,
		GTFS_STATIC.routes,
	);
	const hasSelection = selectedRouteIds.length > 0;
	const summary = hasSelection
		? options
				.filter((option) => selectedRouteIds.includes(option.routeId))
				.map((option) => option.route?.shortName ?? option.routeId)
				.join(", ")
		: "toutes";

	function toggle(routeId: string): void {
		onChange(
			selectedRouteIds.includes(routeId)
				? selectedRouteIds.filter((selected) => selected !== routeId)
				: [...selectedRouteIds, routeId],
		);
	}

	return (
		<div className="line-filter">
			<div className="line-filter__header">
				<button
					type="button"
					className="line-filter__toggle"
					aria-expanded={isOpen}
					aria-controls={optionsId}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className="line-filter__title">Lignes</span>
					<span className="line-filter__summary">{summary}</span>
					<ChevronIcon />
				</button>
				{hasSelection && (
					<button
						type="button"
						className="line-filter__reset"
						onClick={() => onChange([])}
					>
						Toutes
					</button>
				)}
			</div>

			{isOpen && (
				<div
					id={optionsId}
					className="line-filter__options"
					role="group"
					aria-label="Lignes affichées"
				>
					{options.length === 0 ? (
						<p className="line-filter__empty">Aucune ligne en circulation</p>
					) : (
						options.map(({ routeId, route, vehicleCount }) => {
							const label = route?.shortName ?? routeId;
							const vehicleCountLabel = `${vehicleCount} véhicule${vehicleCount > 1 ? "s" : ""}`;
							return (
								<button
									key={routeId}
									type="button"
									className="line-filter__option"
									aria-pressed={selectedRouteIds.includes(routeId)}
									aria-label={`Ligne ${label}, ${vehicleCountLabel}`}
									title={
										route
											? `${route.longName} · ${vehicleCountLabel}`
											: vehicleCountLabel
									}
									onClick={() => toggle(routeId)}
								>
									<LineBadge
										label={label}
										color={route?.color}
										textColor={route?.textColor}
									/>
									<span
										className="line-filter__count"
										aria-hidden="true"
									>
										{vehicleCount}
									</span>
								</button>
							);
						})
					)}
				</div>
			)}
		</div>
	);
}
