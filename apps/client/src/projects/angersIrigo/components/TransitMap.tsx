/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { point, Popup, setOptions } from "leaflet";
import {
	type JSX,
	type RefObject,
	useCallback,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	MapContainer,
	TileLayer,
	useMapEvents,
	ZoomControl,
} from "react-leaflet";

import { MAP_CENTER, MAP_ZOOM } from "../config";
import type { TripUpdate } from "../types/gtfs-realtime";
import type { StopFocusRequest, StopGroup } from "../types/stop";
import type { Vehicle } from "../types/vehicle";
import { filterStopsByRoute } from "../utils/stops";
import { FocusedStopMarker } from "./FocusedStopMarker";
import { FollowStatus } from "./FollowStatus";
import { StopsLayer } from "./StopsLayer";
import { TripPathLayer } from "./TripPathLayer";
import { VehicleFollower } from "./VehicleFollower";
import { VehicleMarker } from "./VehicleMarker";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
/** Marge entre une popup recentrée et le bord de la carte ou les panneaux */
const POPUP_PAN_PADDING_PX = 8;

type TransitMapProps = {
	vehicles: Vehicle[];
	/** Arrêts à afficher ; liste vide pour les masquer */
	stops: StopGroup[];
	/** Lignes de chaque arrêt (voir indexRoutesByStopGroup), une fois les tracés chargés */
	routeIdsByStopGroup?: ReadonlyMap<string, ReadonlySet<string>> | undefined;
	tripUpdates: ReadonlyMap<string, TripUpdate>;
	/** Arrêt choisi hors de la carte, sur lequel se centrer */
	stopFocus?: StopFocusRequest | undefined;
	/** Popup de cet arrêt refermée */
	onStopFocusEnd: () => void;
	/** Conteneur des panneaux posés sur la carte, que les popups doivent éviter */
	overlaysRef: RefObject<HTMLElement | null>;
};

/** Appelle `onClick` lors d'un clic sur le fond de carte (pas sur un véhicule ni un arrêt) */
function MapBackgroundClick({ onClick }: { onClick: () => void }): null {
	useMapEvents({ click: onClick });
	return null;
}

/**
 * Recentrage automatique des popups (autoPan de Leaflet), qui décale la carte pour qu'une popup tienne à l'écran :
 * - à l'ouverture, il évite aussi les panneaux posés sur la carte, que Leaflet ignore : sur mobile,
 *   le panneau d'infos couvre tout le haut et cacherait le haut des popups ;
 * - react-leaflet le relance à chaque mise à jour du contenu (chaque seconde pour un véhicule) : une
 *   popup ouverte ramènerait la carte vers elle dès qu'on l'en éloigne. Il cesse donc dès que la carte
 *   bouge pour une autre raison (glisser, zoom, recentrage sur un arrêt…), jusqu'à la prochaine ouverture.
 */
function PopupAutoPan({
	overlaysRef,
}: {
	overlaysRef: RefObject<HTMLElement | null>;
}): null {
	// Déplacement de la carte dû au recentrage lui-même, qui ne doit pas l'arrêter
	const isAutoPanningRef = useRef(false);
	const map = useMapEvents({
		popupopen: ({ popup }) => {
			const popupRect = popup.getElement()?.getBoundingClientRect();
			if (!popupRect || !overlaysRef.current) {
				return;
			}
			const mapTop = map.getContainer().getBoundingClientRect().top;
			let topInset = 0;
			for (const panel of overlaysRef.current.children) {
				const rect = panel.getBoundingClientRect();
				if (rect.left < popupRect.right && rect.right > popupRect.left) {
					topInset = Math.max(topInset, rect.bottom - mapTop);
				}
			}
			setOptions(popup, {
				autoPan: true,
				autoPanPaddingTopLeft: point(
					POPUP_PAN_PADDING_PX,
					topInset + POPUP_PAN_PADDING_PX,
				),
			});
			// Relance le recentrage automatique avec cette marge
			popup.update();
		},
		autopanstart: () => {
			isAutoPanningRef.current = true;
		},
		movestart: () => {
			if (isAutoPanningRef.current) {
				return;
			}
			map.eachLayer((layer) => {
				if (layer instanceof Popup) {
					setOptions(layer, { autoPan: false });
				}
			});
		},
		moveend: () => {
			isAutoPanningRef.current = false;
		},
	});
	return null;
}

/** Carte des véhicules et des arrêts */
export function TransitMap({
	vehicles,
	stops,
	routeIdsByStopGroup,
	tripUpdates,
	stopFocus,
	onStopFocusEnd,
	overlaysRef,
}: TransitMapProps): JSX.Element {
	// Dernier véhicule cliqué : son tracé reste affiché, même quand on ouvre ensuite la popup d'un
	// de ses arrêts, jusqu'à un clic sur le fond de carte
	const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
	const selectedVehicle = vehicles.find(
		(vehicle) => vehicle.entityId === selectedVehicleId,
	);
	const clearSelection = useCallback(() => setSelectedVehicleId(undefined), []);

	// Véhicule sélectionné : seuls les arrêts de sa ligne restent affichés. Une ligne absente des
	// horaires embarqués n'a pas d'arrêts connus : tous restent affichés.
	const selectedRouteId = selectedVehicle?.route?.routeId;
	const displayedStops = useMemo(
		() =>
			selectedRouteId !== undefined && routeIdsByStopGroup
				? filterStopsByRoute(
						stops,
						routeIdsByStopGroup,
						(routeId) => routeId === selectedRouteId,
					)
				: stops,
		[stops, routeIdsByStopGroup, selectedRouteId],
	);

	// Véhicule suivi : la carte reste centrée dessus jusqu'à ce qu'on la déplace à la main
	const [followedVehicleId, setFollowedVehicleId] = useState<string>();
	const followedVehicle = vehicles.find(
		(vehicle) => vehicle.entityId === followedVehicleId,
	);
	const toggleFollow = useCallback(
		(entityId: string) =>
			setFollowedVehicleId((current) =>
				current === entityId ? undefined : entityId,
			),
		[],
	);
	const stopFollowing = useCallback(() => setFollowedVehicleId(undefined), []);

	return (
		<>
			{/* Zoom déplacé en bas à droite : le panneau d'infos occupe le coin supérieur gauche */}
			<MapContainer
				id="map"
				center={MAP_CENTER}
				zoom={MAP_ZOOM}
				zoomControl={false}
			>
				<TileLayer
					url={TILE_URL}
					attribution={TILE_ATTRIBUTION}
					maxZoom={19}
				/>
				<ZoomControl position="bottomright" />
				<MapBackgroundClick onClick={clearSelection} />
				<PopupAutoPan overlaysRef={overlaysRef} />
				{selectedVehicle && (
					<TripPathLayer
						vehicle={selectedVehicle}
						tripUpdates={tripUpdates}
					/>
				)}
				<StopsLayer
					stops={displayedStops}
					tripUpdates={tripUpdates}
				/>
				{stopFocus && (
					<FocusedStopMarker
						request={stopFocus}
						tripUpdates={tripUpdates}
						onClose={onStopFocusEnd}
					/>
				)}
				{vehicles.map((vehicle) => (
					// entityId est stable d'un rafraîchissement à l'autre : React déplace le marqueur au lieu de le recréer
					<VehicleMarker
						key={vehicle.entityId}
						vehicle={vehicle}
						onSelect={setSelectedVehicleId}
						isFollowed={vehicle.entityId === followedVehicleId}
						onFollowToggle={toggleFollow}
					/>
				))}
				{followedVehicleId && (
					// key : suivre un autre véhicule repart de zéro (nouveau vol vers lui)
					<VehicleFollower
						key={followedVehicleId}
						vehicle={followedVehicle}
						onStop={stopFollowing}
						overlaysRef={overlaysRef}
					/>
				)}
			</MapContainer>
			{followedVehicleId && (
				<FollowStatus
					vehicle={followedVehicle}
					onStop={stopFollowing}
				/>
			)}
		</>
	);
}
