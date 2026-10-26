/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./TripTimeMarkers.scss";

import { type DivIcon, divIcon, type Marker as LeafletMarker } from "leaflet";
import { type JSX, useMemo, useRef, useState } from "react";
import { Marker, Pane } from "react-leaflet";

import { SIMULATION_TICK_MS } from "../config";
import {
	easeInOut,
	linear,
	useMarkerAnimation,
} from "../hooks/useMarkerAnimation";
import type { Point } from "../types/geo";
import { getTimeMarkers, type VehicleMotion } from "../utils/simulation";

/** Au-dessus du tracé (350) et des arrêts (400), sous les véhicules (600) */
const PANE_Z_INDEX = 450;
/** Même valeur que $color-bus : lignes sans couleur connue */
const DEFAULT_LINE_COLOR = "#2f3b48";
/** Même durée que le glissement d'un véhicule vers une nouvelle position reçue */
const MOVE_DURATION_MS = 1000;

/** "5 min", "1 h", "1 h 20" */
function formatMinutes(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} min`;
	}
	const rest = minutes % 60;
	return `${Math.floor(minutes / 60)} h${rest ? ` ${String(rest).padStart(2, "0")}` : ""}`;
}

/** Les couleurs sont déjà validées au format #RRGGBB (voir data/gtfs-static.ts) */
function createTimeMarkerIcon(minutes: number, color: string): DivIcon {
	return divIcon({
		className: "trip-time-marker",
		// Taille nulle : l'étiquette est centrée sur le point par le SCSS, quelle que soit sa largeur
		iconSize: [0, 0],
		html: `<span class="trip-time-marker__label" style="--line-color:${color}">${formatMinutes(minutes)}</span>`,
	});
}

type TimeMarkerProps = {
	minutes: number;
	point: Point;
	color: string;
	isSimulated: boolean;
};

/** Un repère : comme un véhicule, il glisse d'une position à la suivante au lieu de sauter */
function TimeMarker({
	minutes,
	point,
	color,
	isSimulated,
}: TimeMarkerProps): JSX.Element {
	const markerRef = useRef<LeafletMarker>(null);
	const [initialPosition] = useState(point);
	useMarkerAnimation(
		markerRef,
		point,
		isSimulated ? SIMULATION_TICK_MS : MOVE_DURATION_MS,
		isSimulated ? linear : easeInOut,
	);
	const icon = useMemo(
		() => createTimeMarkerIcon(minutes, color),
		[minutes, color],
	);

	return (
		<Marker
			ref={markerRef}
			position={initialPosition}
			icon={icon}
			interactive={false}
			keyboard={false}
		/>
	);
}

type TripTimeMarkersProps = {
	motion: VehicleMotion;
	/**
	 * Instant de la position affichée du véhicule (s depuis l'epoch) : l'instant présent quand
	 * la simulation le fait avancer, sinon celui de sa dernière position reçue
	 */
	fromSeconds: number;
	/** La simulation fait avancer le véhicule, et les repères avec lui */
	isSimulated: boolean;
	intervalMinutes: number;
	color?: string | undefined;
};

/** Repères posés sur le tracé à venir d'un véhicule : où il devrait être dans 5, 10, 15 min… */
export function TripTimeMarkers({
	motion,
	fromSeconds,
	isSimulated,
	intervalMinutes,
	color = DEFAULT_LINE_COLOR,
}: TripTimeMarkersProps): JSX.Element {
	return (
		<Pane
			name="trip-time-markers"
			style={{ zIndex: PANE_Z_INDEX }}
		>
			{getTimeMarkers(motion, fromSeconds, intervalMinutes).map(
				({ minutes, point }) => (
					// minutes : chaque repère garde son marqueur et glisse le long du tracé
					<TimeMarker
						key={minutes}
						minutes={minutes}
						point={point}
						color={color}
						isSimulated={isSimulated}
					/>
				),
			)}
		</Pane>
	);
}
