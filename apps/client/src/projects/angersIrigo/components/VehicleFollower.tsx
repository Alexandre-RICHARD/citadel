/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import {
	type LatLng,
	type Map as LeafletMap,
	type MapOptions,
	type PopupEvent,
	setOptions,
} from "leaflet";
import { type RefObject, useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";

import { FOLLOWED_VEHICLE_ZOOM, SIMULATION_TICK_MS } from "../config";
import type { Vehicle } from "../types/vehicle";

/** Durée du glissement d'un marqueur vers une position reçue (MOVE_DURATION_MS de VehicleMarker) */
const RECEIVED_MOVE_DURATION_S = 1;

/** Commandes de zoom qui, pendant le suivi, zooment sur le centre (le véhicule) plutôt que sur le pointeur */
const ZOOM_OPTIONS = [
	"scrollWheelZoom",
	"touchZoom",
	"doubleClickZoom",
] as const;

const prefersReducedMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)",
);

/**
 * Centre à donner à la carte pour que le véhicule soit au milieu de sa partie visible : sous les
 * panneaux qui recouvrent le haut de la carte en son milieu (sur mobile), sa popup reste lisible.
 */
function getFollowCenter(
	map: LeafletMap,
	position: [number, number],
	zoom: number,
	overlays: HTMLElement | null,
): LatLng {
	const mapRect = map.getContainer().getBoundingClientRect();
	const middleX = mapRect.left + mapRect.width / 2;
	let topInset = 0;
	for (const panel of overlays?.children ?? []) {
		const rect = panel.getBoundingClientRect();
		if (rect.left < middleX && rect.right > middleX) {
			topInset = Math.max(topInset, rect.bottom - mapRect.top);
		}
	}
	// Le véhicule apparaît topInset / 2 plus bas que le centre de la carte
	return map.unproject(
		map.project(position, zoom).subtract([0, topInset / 2]),
		zoom,
	);
}

type VehicleFollowerProps = {
	/** Véhicule suivi ; undefined tant qu'il n'est plus affiché (le suivi reprend s'il réapparaît) */
	vehicle?: Vehicle | undefined;
	/** L'utilisateur a déplacé la carte à la main */
	onStop: () => void;
	/** Conteneur des panneaux posés sur la carte, sous lesquels placer le véhicule */
	overlaysRef: RefObject<HTMLElement | null>;
};

/**
 * Garde le véhicule suivi au centre de la carte. À chaque nouvelle position, la carte glisse
 * jusqu'à elle à la même vitesse que le marqueur (voir useMarkerAnimation), qui semble donc
 * immobile à l'écran. Déplacer la carte arrête le suivi ; zoomer non.
 * À remonter (prop key) pour suivre un autre véhicule.
 */
export function VehicleFollower({
	vehicle,
	onStop,
	overlaysRef,
}: VehicleFollowerProps): null {
	const map = useMap();
	// Vol vers le véhicule ou zoom en cours : un glissement de la carte les interromprait
	const isMapBusyRef = useRef(false);
	const hasReachedVehicleRef = useRef(false);
	const latitude = vehicle?.position.latitude;
	const longitude = vehicle?.position.longitude;
	const isSimulated = vehicle?.simulatedDistance !== undefined;

	useMapEvents({
		dragstart: onStop,
		zoomstart: () => {
			isMapBusyRef.current = true;
		},
		zoomend: () => {
			isMapBusyRef.current = false;
		},
	});

	// Les gestionnaires de zoom de Leaflet relisent ces options à chaque geste
	useEffect(() => {
		const previousOptions: Partial<MapOptions> = {};
		const followOptions: Partial<MapOptions> = {};
		for (const option of ZOOM_OPTIONS) {
			previousOptions[option] = map.options[option];
			followOptions[option] = map.options[option] && "center";
		}
		setOptions(map, followOptions);
		return () => {
			setOptions(map, previousOptions);
		};
	}, [map]);

	// Une popup ouverte se recentre (autoPan) à chaque mise à jour de son contenu, chaque seconde
	// pour un véhicule, et interromprait chaque glissement de la carte. Le vol vers le véhicule
	// l'arrête pour les popups déjà ouvertes (voir PopupAutoPan dans TransitMap) ; on l'arrête aussi
	// pour celles ouvertes pendant le suivi. Leur prochaine ouverture le rétablira.
	useEffect(() => {
		function pauseAutoPan({ popup }: PopupEvent): void {
			setOptions(popup, { autoPan: false });
		}
		map.on("popupopen", pauseAutoPan);
		return () => {
			map.off("popupopen", pauseAutoPan);
		};
	}, [map]);

	useEffect(() => {
		if (
			latitude === undefined ||
			longitude === undefined ||
			isMapBusyRef.current
		) {
			return;
		}
		const animate = !prefersReducedMotion.matches;

		// Début du suivi : la carte rejoint le véhicule en se rapprochant au besoin
		if (!hasReachedVehicleRef.current) {
			hasReachedVehicleRef.current = true;
			isMapBusyRef.current = true;
			map.once("moveend", () => {
				isMapBusyRef.current = false;
			});
			const zoom = Math.max(map.getZoom(), FOLLOWED_VEHICLE_ZOOM);
			map.flyTo(
				getFollowCenter(map, [latitude, longitude], zoom, overlaysRef.current),
				zoom,
				{ animate },
			);
			return;
		}

		// Même durée et même courbe que le glissement du marqueur : linéaire pour la simulation
		map.panTo(
			getFollowCenter(
				map,
				[latitude, longitude],
				map.getZoom(),
				overlaysRef.current,
			),
			{
				animate,
				duration: isSimulated
					? SIMULATION_TICK_MS / 1000
					: RECEIVED_MOVE_DURATION_S,
				easeLinearity: isSimulated ? 1 : 0.5,
				noMoveStart: true,
			},
		);
	}, [map, latitude, longitude, isSimulated, overlaysRef]);

	return null;
}
