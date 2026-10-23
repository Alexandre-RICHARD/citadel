/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./VehiclePopup.scss";

import type { JSX } from "react";

import { useNow } from "../hooks/useNow";
import type { Vehicle } from "../types/vehicle";
import { formatAge, formatEta, STOP_STATUS_LABELS } from "../utils/format";
import { getLineLabel } from "../utils/vehicles";
import { LineBadge } from "./LineBadge";

/** Les délais sont en minutes : les recalculer toutes les 30 s suffit */
const ETA_REFRESH_INTERVAL_MS = 30_000;

/** Terminus au-delà de l'horizon du flux (environ une heure) */
const BEYOND_FORECAST_LABEL = "dans plus d'1 h";

type VehiclePopupProps = {
	vehicle: Vehicle;
	/** La carte suit ce véhicule */
	isFollowed: boolean;
	onFollowToggle: () => void;
};

export function VehiclePopup({
	vehicle,
	isFollowed,
	onFollowToggle,
}: VehiclePopupProps): JSX.Element {
	// Le composant n'existe que tant que la popup est ouverte : pas de minuterie pour les autres véhicules
	const now = useNow(ETA_REFRESH_INTERVAL_MS);

	const kindLabel = vehicle.kind === "tram" ? "Tram" : "Bus";
	const vehicleNumber = vehicle.vehicle?.label ?? vehicle.vehicle?.id;
	const stopName = vehicle.stop?.name ?? vehicle.stopId;
	const stopStatusLabel =
		STOP_STATUS_LABELS[vehicle.currentStatus ?? "IN_TRANSIT_TO"];
	const { terminusArrival } = vehicle;

	return (
		<div className="vehicle-popup">
			<div className="vehicle-popup__line">
				<LineBadge
					label={getLineLabel(vehicle)}
					color={vehicle.route?.color}
					textColor={vehicle.route?.textColor}
				/>
				<span className="vehicle-popup__line-name">
					{vehicle.destination
						? `→ ${vehicle.destination}`
						: (vehicle.route?.longName ?? "Ligne inconnue")}
				</span>
			</div>

			<dl className="vehicle-popup__details">
				<dt>{kindLabel}</dt>
				<dd>{vehicleNumber ? `n° ${vehicleNumber}` : "Numéro inconnu"}</dd>

				{stopName && (
					<>
						<dt>{stopStatusLabel}</dt>
						<dd>
							{stopName}
							{vehicle.stopTime !== undefined && (
								<span className="vehicle-popup__eta">
									{formatEta(vehicle.stopTime, now)}
								</span>
							)}
						</dd>
					</>
				)}

				{vehicle.destination && (
					<>
						<dt>Terminus</dt>
						<dd>
							{vehicle.destination}
							{terminusArrival && (
								<span className="vehicle-popup__eta">
									{terminusArrival.isBeyondForecast
										? BEYOND_FORECAST_LABEL
										: formatEta(terminusArrival.time, now)}
								</span>
							)}
						</dd>
					</>
				)}

				{vehicle.positionAgeSeconds !== undefined && (
					<>
						<dt>Position</dt>
						<dd>
							{vehicle.simulatedDistance !== undefined
								? `estimée (signal reçu ${formatAge(vehicle.positionAgeSeconds)})`
								: formatAge(vehicle.positionAgeSeconds)}
						</dd>
					</>
				)}
			</dl>

			<button
				type="button"
				className="vehicle-popup__follow"
				aria-pressed={isFollowed}
				onClick={onFollowToggle}
			>
				{isFollowed ? "Ne plus suivre" : "Suivre ce véhicule"}
			</button>
		</div>
	);
}
