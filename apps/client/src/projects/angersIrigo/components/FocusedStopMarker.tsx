/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { CircleMarker as LeafletCircleMarker, PathOptions } from "leaflet";
import { type JSX, useEffect, useMemo, useRef } from "react";
import { CircleMarker, Pane, useMap } from "react-leaflet";

import { FOCUSED_STOP_ZOOM } from "../config";
import type { TripUpdate } from "../types/gtfs-realtime";
import type { StopFocusRequest } from "../types/stop";
import { StopMarkerPopup } from "./StopMarkerPopup";

/** Au-dessus des arrêts (400), sous les véhicules (600) */
const PANE_Z_INDEX = 450;
/** Arrêt mis en évidence : plus grand que les autres, contour de la couleur de focus ($color-focus) */
const PATH_OPTIONS: PathOptions = {
	color: "#2563eb",
	weight: 3,
	fillColor: "#fff",
	fillOpacity: 1,
};
const RADIUS_PX = 7;

type FocusedStopMarkerProps = {
	request: StopFocusRequest;
	tripUpdates: ReadonlyMap<string, TripUpdate>;
	/** Popup fermée : le marqueur n'a plus lieu d'être */
	onClose: () => void;
};

function FocusedStopCircle({
	request,
	tripUpdates,
	onClose,
}: FocusedStopMarkerProps): JSX.Element {
	const map = useMap();
	const markerRef = useRef<LeafletCircleMarker>(null);
	const { stop } = request;

	useEffect(() => {
		const marker = markerRef.current;
		if (!marker) {
			return undefined;
		}
		// Ouverte en vol, la popup recentrerait la carte sur elle (autoPan) et casserait l'animation
		function openPopup(): void {
			// Déclaration de fonction (hissée) : TypeScript ne garde pas la vérification ci-dessus
			marker?.openPopup();
		}
		map.once("moveend", openPopup);
		map.flyTo(
			[request.stop.latitude, request.stop.longitude],
			Math.max(map.getZoom(), FOCUSED_STOP_ZOOM),
			{
				animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
			},
		);
		return () => {
			map.off("moveend", openPopup);
		};
		// Chaque demande est un nouvel objet : un nouveau clic sur le même favori relance le trajet
	}, [map, request]);

	const eventHandlers = useMemo(() => ({ popupclose: onClose }), [onClose]);

	return (
		<CircleMarker
			ref={markerRef}
			center={[stop.latitude, stop.longitude]}
			radius={RADIUS_PX}
			bubblingMouseEvents={false}
			pathOptions={PATH_OPTIONS}
			eventHandlers={eventHandlers}
		>
			<StopMarkerPopup
				stop={stop}
				tripUpdates={tripUpdates}
			/>
		</CircleMarker>
	);
}

/**
 * Arrêt choisi hors de la carte (favori, recherche) : la carte s'y rend puis ouvre sa popup.
 * Dessiné à part, dans son propre calque, pour être visible et cliquable même si les arrêts sont
 * masqués ou que le zoom était trop faible pour les afficher.
 */
export function FocusedStopMarker(props: FocusedStopMarkerProps): JSX.Element {
	// Pane n'affiche ses enfants qu'une fois le calque créé : le marqueur existe dès le premier effet du cercle
	return (
		<Pane
			name="focused-stop"
			style={{ zIndex: PANE_Z_INDEX }}
		>
			{/* eslint-disable-next-line react/jsx-props-no-spreading -- simple relais des props vers le cercle */}
			<FocusedStopCircle {...props} />
		</Pane>
	);
}
