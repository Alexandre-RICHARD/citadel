/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./VehicleMarker.scss";

import { type DivIcon, divIcon, type Marker as LeafletMarker } from "leaflet";
import { type JSX, useMemo, useRef, useState } from "react";
import { Marker, Popup } from "react-leaflet";

import { SIMULATION_TICK_MS } from "../config";
import {
	easeInOut,
	linear,
	useMarkerAnimation,
} from "../hooks/useMarkerAnimation";
import type { Point } from "../types/geo";
import type { Vehicle, VehicleKind } from "../types/vehicle";
import { getLineLabel } from "../utils/vehicles";
import { VehiclePopup } from "./VehiclePopup";

/** Diamètre du marqueur en px ; 26 px suffisent pour un numéro de bus à 3 chiffres */
const MARKER_SIZE_PX: Record<VehicleKind, number> = { tram: 30, bus: 26 };

/** Durée du glissement vers une nouvelle position reçue */
const MOVE_DURATION_MS = 1000;

/** Les trams passent au-dessus des bus quand les marqueurs se chevauchent */
const TRAM_Z_INDEX_OFFSET = 1000;

type MarkerIconOptions = {
	kind: VehicleKind;
	label: string;
	color?: string | undefined;
	textColor?: string | undefined;
	bearing?: number | undefined;
	isStale: boolean;
};

function escapeHtml(text: string): string {
	return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Leaflet attend du HTML brut pour un marqueur personnalisé (divIcon), pas un composant React.
 * Le libellé est échappé ; les couleurs sont déjà validées au format #RRGGBB (voir data/gtfs-static.ts).
 */
function createMarkerIcon({
	kind,
	label,
	color,
	textColor,
	bearing,
	isStale,
}: MarkerIconOptions): DivIcon {
	const size = MARKER_SIZE_PX[kind];
	const staleClassName = isStale ? " vehicle-marker--stale" : "";
	// Seuls les trams prennent la couleur de leur ligne ; les bus gardent la couleur neutre du SCSS
	const lineColors =
		kind === "tram" && color
			? `--line-color:${color};--line-text-color:${textColor ?? "#fff"}`
			: "";
	const heading =
		bearing !== undefined
			? `<span class="vehicle-marker__heading" style="transform:rotate(${bearing}deg)"></span>`
			: "";

	return divIcon({
		className: `vehicle-marker vehicle-marker--${kind}${staleClassName}`,
		iconSize: [size, size],
		html: `<span class="vehicle-marker__body" style="${lineColors}">${heading}<span class="vehicle-marker__label">${escapeHtml(label)}</span></span>`,
	});
}

type VehicleMarkerProps = {
	vehicle: Vehicle;
	/** Appelé à l'ouverture de la popup du véhicule */
	onSelect: (entityId: string) => void;
	/** La carte suit ce véhicule */
	isFollowed: boolean;
	/** Bouton « Suivre » de la popup */
	onFollowToggle: (entityId: string) => void;
};

export function VehicleMarker({
	vehicle,
	onSelect,
	isFollowed,
	onFollowToggle,
}: VehicleMarkerProps): JSX.Element {
	const { latitude, longitude, bearing } = vehicle.position;
	const { kind, route, isStale } = vehicle;
	const label = getLineLabel(vehicle);

	// react-leaflet ne reçoit que la position initiale : s'il recevait la position courante, il
	// téléporterait le marqueur à chaque rafraîchissement. Les déplacements suivants sont animés.
	const markerRef = useRef<LeafletMarker>(null);
	const [initialPosition] = useState<Point>(() => [latitude, longitude]);
	// Position simulée : renouvelée toutes les SIMULATION_TICK_MS, chaque glissement enchaîne sur le suivant
	const isSimulated = vehicle.simulatedDistance !== undefined;
	useMarkerAnimation(
		markerRef,
		[latitude, longitude],
		isSimulated ? SIMULATION_TICK_MS : MOVE_DURATION_MS,
		isSimulated ? linear : easeInOut,
	);

	// Recréer l'icône remplace l'élément DOM du marqueur : on ne le fait que si son apparence change
	const icon = useMemo(
		() =>
			createMarkerIcon({
				kind,
				label,
				color: route?.color,
				textColor: route?.textColor,
				bearing,
				isStale,
			}),
		[kind, label, route?.color, route?.textColor, bearing, isStale],
	);

	const { entityId } = vehicle;
	const eventHandlers = useMemo(
		() => ({ popupopen: () => onSelect(entityId) }),
		[entityId, onSelect],
	);

	return (
		<Marker
			ref={markerRef}
			position={initialPosition}
			icon={icon}
			zIndexOffset={kind === "tram" ? TRAM_Z_INDEX_OFFSET : 0}
			title={`${kind === "tram" ? "Tram" : "Bus"} ligne ${label}`}
			eventHandlers={eventHandlers}
		>
			<Popup className="app-popup">
				<VehiclePopup
					vehicle={vehicle}
					isFollowed={isFollowed}
					onFollowToggle={() => onFollowToggle(entityId)}
				/>
			</Popup>
		</Marker>
	);
}
