/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { PathOptions } from "leaflet";
import type { JSX } from "react";
import { CircleMarker, Pane, Polyline } from "react-leaflet";

import { GTFS_STATIC } from "../data/gtfs-static";
import { STOP_GROUP_BY_STOP_ID } from "../data/stop-groups";
import { useShapes } from "../hooks/useShapes";
import type { TripUpdate } from "../types/gtfs-realtime";
import type { Vehicle } from "../types/vehicle";
import { getPathLength, slicePath, toPoint } from "../utils/geo";
import { getDistanceAlongShape, getTripShape } from "../utils/shapes";
import { StopMarkerPopup } from "./StopMarkerPopup";
import { stopsRenderer } from "./stops-renderer";

/** Même valeur que $color-bus : lignes sans couleur connue */
const DEFAULT_LINE_COLOR = "#2f3b48";
/** Sous les arrêts (400) et les véhicules (600) */
const PANE_Z_INDEX = 350;
/** Portion déjà parcourue et arrêts déjà desservis, estompés */
const PASSED_OPACITY = 0.35;

/** Liseré blanc sous le tracé, pour qu'il ressorte sur le fond de carte */
const CASING_OPTIONS: PathOptions = { color: "#fff", weight: 9, opacity: 0.9 };
const LINE_WEIGHT_PX = 5;
const STOP_RADIUS_PX = 3.5;

type TripPathLayerProps = {
	vehicle: Vehicle;
	tripUpdates: ReadonlyMap<string, TripUpdate>;
};

/** Tracé complet de la course d'un véhicule, aux couleurs de sa ligne, avec ses arrêts cliquables */
export function TripPathLayer({
	vehicle,
	tripUpdates,
}: TripPathLayerProps): JSX.Element | null {
	const shapes = useShapes();
	const shape =
		shapes && getTripShape(vehicle.trip?.tripId, shapes, GTFS_STATIC);
	if (!shape) {
		return null;
	}

	const color = vehicle.route?.color ?? DEFAULT_LINE_COLOR;
	const traveledDistance =
		vehicle.simulatedDistance ?? getDistanceAlongShape(shape, vehicle);
	const lineOptions: PathOptions = { color, weight: LINE_WEIGHT_PX };

	// interactive est passé directement : Leaflet ne le lit qu'à la création du tracé
	return (
		<>
			<Pane
				name="trip-path"
				style={{ zIndex: PANE_Z_INDEX }}
			>
				<Polyline
					positions={shape.points}
					pathOptions={CASING_OPTIONS}
					interactive={false}
				/>
				<Polyline
					positions={slicePath(shape, 0, traveledDistance)}
					pathOptions={{ ...lineOptions, opacity: PASSED_OPACITY }}
					interactive={false}
				/>
				<Polyline
					positions={slicePath(shape, traveledDistance, getPathLength(shape))}
					pathOptions={lineOptions}
					interactive={false}
				/>
			</Pane>

			{/* Hors du calque du tracé : dessinés avec les autres arrêts, au-dessus, et cliquables comme eux */}
			{shape.stops.map((shapeStop, index) => {
				const stop = GTFS_STATIC.stops.get(shapeStop.stopId);
				const stopGroup = STOP_GROUP_BY_STOP_ID.get(shapeStop.stopId);
				if (!stop || !stopGroup) {
					return null;
				}
				const opacity =
					shapeStop.distance < traveledDistance ? PASSED_OPACITY : 1;
				return (
					<CircleMarker
						// Un arrêt peut figurer deux fois sur un tracé (ligne circulaire) : l'indice sert de clé
						// eslint-disable-next-line react/no-array-index-key -- voir ci-dessus
						key={index}
						center={toPoint(stop)}
						radius={STOP_RADIUS_PX}
						renderer={stopsRenderer}
						bubblingMouseEvents={false}
						pathOptions={{
							color,
							weight: 2,
							opacity,
							fillColor: "#fff",
							fillOpacity: opacity,
						}}
					>
						<StopMarkerPopup
							stop={stopGroup}
							tripUpdates={tripUpdates}
						/>
					</CircleMarker>
				);
			})}
		</>
	);
}
