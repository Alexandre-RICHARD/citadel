/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { JSX } from "react";
import { Popup, useMap } from "react-leaflet";

import type { TripUpdate } from "../types/gtfs-realtime";
import type { StopGroup } from "../types/stop";
import { StopPopup } from "./StopPopup";

const MIN_WIDTH_PX = 400;
const MAX_WIDTH_PX = 460;
/** Marge laissée de part et d'autre de la popup quand la carte est étroite */
const MARGIN_PX = 40;
/** Au-delà, la popup défile (arrêts desservis par beaucoup de lignes) */
const MAX_HEIGHT_PX = 420;

type StopMarkerPopupProps = {
	stop: StopGroup;
	tripUpdates: ReadonlyMap<string, TripUpdate>;
};

/** Popup des prochains passages, à placer dans le marqueur d'un arrêt */
export function StopMarkerPopup({
	stop,
	tripUpdates,
}: StopMarkerPopupProps): JSX.Element {
	const map = useMap();

	// Leaflet dimensionne la popup d'après la largeur naturelle de son contenu (300 px max par
	// défaut) : on impose une largeur assez grande pour deux colonnes, bornée par celle de la carte
	const availableWidth = map.getSize().x - MARGIN_PX;

	return (
		<Popup
			className="app-popup"
			// Sinon react-leaflet la placerait dans le calque du marqueur (voir FocusedStopMarker), sous les véhicules
			pane="popupPane"
			minWidth={Math.min(MIN_WIDTH_PX, availableWidth)}
			maxWidth={Math.min(MAX_WIDTH_PX, availableWidth)}
			maxHeight={MAX_HEIGHT_PX}
		>
			<StopPopup
				stop={stop}
				tripUpdates={tripUpdates}
			/>
		</Popup>
	);
}
