/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { PathOptions } from "leaflet";
import { type JSX, memo, useState } from "react";
import { CircleMarker, useMap, useMapEvents } from "react-leaflet";

import { STOPS_MIN_ZOOM } from "../config";
import type { TripUpdate } from "../types/gtfs-realtime";
import type { StopGroup } from "../types/stop";
import { StopMarkerPopup } from "./StopMarkerPopup";
import { stopsRenderer } from "./stops-renderer";

const STOP_PATH_OPTIONS: PathOptions = {
	color: "#2f3b48",
	weight: 2,
	fillColor: "#fff",
	fillOpacity: 1,
};
const STOP_RADIUS_PX = 5;

type StopsLayerProps = {
	stops: StopGroup[];
	tripUpdates: ReadonlyMap<string, TripUpdate>;
};

/**
 * Arrêts cliquables, affichés seulement à partir de STOPS_MIN_ZOOM. Mémoïsé : la carte se
 * redessine chaque seconde avec la simulation, les ~900 arrêts seulement quand ils changent.
 */
export const StopsLayer = memo(function StopsLayer({
	stops,
	tripUpdates,
}: StopsLayerProps): JSX.Element | null {
	const map = useMap();
	const [zoom, setZoom] = useState(() => map.getZoom());
	useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

	if (zoom < STOPS_MIN_ZOOM) {
		return null;
	}

	return (
		<>
			{stops.map((stop) => (
				<CircleMarker
					key={stop.id}
					center={[stop.latitude, stop.longitude]}
					radius={STOP_RADIUS_PX}
					renderer={stopsRenderer}
					// Un clic sur un arrêt n'est pas un clic sur le fond de carte (qui masque le tracé affiché)
					bubblingMouseEvents={false}
					pathOptions={STOP_PATH_OPTIONS}
				>
					<StopMarkerPopup
						stop={stop}
						tripUpdates={tripUpdates}
					/>
				</CircleMarker>
			))}
		</>
	);
});
