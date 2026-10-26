/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { STALE_POSITION_SECONDS } from "../config";
import type {
	FeedMessage,
	TripUpdate,
	VehiclePosition,
} from "../types/gtfs-realtime";
import type { GtfsRoute, GtfsStaticData } from "../types/gtfs-static";
import type { TripShape } from "../types/shape";
import type {
	LineOption,
	TerminusArrival,
	Vehicle,
	VehicleFilter,
	VehicleKind,
} from "../types/vehicle";
import { compareRoutes, isTramRoute } from "./routes";
import { getTripShape } from "./shapes";
import {
	findStopTime,
	findTerminusArrival,
	findTerminusTime,
} from "./trip-updates";

/**
 * Âge de la position, mesuré par rapport à l'heure de génération du flux plutôt qu'à
 * l'horloge du navigateur, qui peut être décalée.
 */
function getPositionAge(
	vehiclePosition: VehiclePosition,
	feedTimestamp: number | undefined,
): number | undefined {
	if (vehiclePosition.timestamp === undefined || feedTimestamp === undefined) {
		return undefined;
	}
	return Math.max(0, feedTimestamp - vehiclePosition.timestamp);
}

/**
 * Arrivée prévue au terminus. Le tracé de la course donne l'arrêt du terminus ; tant que les
 * tracés ne sont pas chargés, on le reconnaît à son nom, s'il figure dans le flux.
 */
function getTerminusArrival(
	tripUpdate: TripUpdate,
	shape: TripShape | undefined,
	destination: string | undefined,
	gtfs: GtfsStaticData,
	referenceTime: number,
): TerminusArrival | undefined {
	const terminusStopId = shape?.stops.at(-1)?.stopId;
	if (terminusStopId !== undefined) {
		return findTerminusArrival(tripUpdate, terminusStopId, referenceTime);
	}
	const time = destination
		? findTerminusTime(tripUpdate, destination, gtfs.stops)
		: undefined;
	return time !== undefined ? { isBeyondForecast: false, time } : undefined;
}

/**
 * Garde les entités du flux qui décrivent un véhicule positionné, et les complète avec le GTFS
 * théorique, les heures de passage prévues (mises à jour de trajet, indexées par tripId) et,
 * une fois chargés, les tracés des courses.
 */
export function extractVehicles(
	feed: FeedMessage,
	gtfs: GtfsStaticData,
	tripUpdates: ReadonlyMap<string, TripUpdate>,
	shapes: ReadonlyMap<string, TripShape> | undefined,
): Vehicle[] {
	const vehicles: Vehicle[] = [];
	const referenceTime = feed.header.timestamp ?? Date.now() / 1000;

	for (const entity of feed.entity ?? []) {
		const vehiclePosition = entity.vehicle;
		const position = vehiclePosition?.position;
		if (!vehiclePosition || !position) {
			continue;
		}

		const { routeId, tripId } = vehiclePosition.trip ?? {};
		const route = routeId !== undefined ? gtfs.routes.get(routeId) : undefined;
		// Ligne inconnue : on suppose un bus, de loin le cas le plus courant
		const kind = route && isTramRoute(route) ? "tram" : "bus";
		const destination =
			tripId !== undefined ? gtfs.trips.get(tripId)?.headsign : undefined;
		const { stopId } = vehiclePosition;

		const tripUpdate =
			tripId !== undefined ? tripUpdates.get(tripId) : undefined;
		const stopTime =
			tripUpdate && stopId !== undefined
				? findStopTime(tripUpdate, stopId)
				: undefined;
		const shape = shapes && getTripShape(tripId, shapes, gtfs);
		const terminusArrival =
			tripUpdate &&
			getTerminusArrival(tripUpdate, shape, destination, gtfs, referenceTime);

		const positionAgeSeconds = getPositionAge(
			vehiclePosition,
			feed.header.timestamp,
		);
		const isStale =
			positionAgeSeconds !== undefined &&
			positionAgeSeconds > STALE_POSITION_SECONDS;

		vehicles.push({
			...vehiclePosition,
			entityId: entity.id,
			position,
			kind,
			route,
			destination,
			stop: stopId !== undefined ? gtfs.stops.get(stopId) : undefined,
			stopTime,
			terminusArrival,
			positionAgeSeconds,
			isStale,
		});
	}

	return vehicles;
}

/** Ligne d'un véhicule : celle du GTFS théorique, sinon l'identifiant donné par le flux */
export function getVehicleRouteId(vehicle: Vehicle): string | undefined {
	return vehicle.route?.routeId ?? vehicle.trip?.routeId;
}

/**
 * Véhicules du mode choisi (Tous / Trams / Bus), puis des lignes choisies s'il y en a.
 * Sans ligne connue, un véhicule n'apparaît que si aucune ligne n'est choisie.
 */
export function filterVehicles(
	vehicles: Vehicle[],
	filter: VehicleFilter,
	routeIds: readonly string[] = [],
): Vehicle[] {
	return vehicles.filter((vehicle) => {
		if (filter !== "all" && vehicle.kind !== filter) {
			return false;
		}
		const routeId = getVehicleRouteId(vehicle);
		return (
			routeIds.length === 0 ||
			(routeId !== undefined && routeIds.includes(routeId))
		);
	});
}

/** Mode d'une ligne, déterminé comme celui de ses véhicules (voir extractVehicles) */
export function getRouteKind(
	routeId: string,
	routes: ReadonlyMap<string, GtfsRoute>,
): VehicleKind {
	const route = routes.get(routeId);
	return route && isTramRoute(route) ? "tram" : "bus";
}

/** Lignes choisies qui restent pertinentes dans le nouveau mode : les lignes de tram si on passe à « Trams »… */
export function keepRoutesOfKind(
	routeIds: readonly string[],
	filter: VehicleFilter,
	routes: ReadonlyMap<string, GtfsRoute>,
): string[] {
	return routeIds.filter(
		(routeId) => filter === "all" || getRouteKind(routeId, routes) === filter,
	);
}

/**
 * Lignes à proposer dans le filtre : celles des véhicules donnés, avec leur nombre de véhicules,
 * plus les lignes déjà choisies même sans véhicule (pour pouvoir les retirer). Trams d'abord.
 */
export function getLineOptions(
	vehicles: Vehicle[],
	selectedRouteIds: readonly string[],
	routes: ReadonlyMap<string, GtfsRoute>,
): LineOption[] {
	const counts = new Map<string, number>(
		selectedRouteIds.map((routeId) => [routeId, 0]),
	);
	for (const vehicle of vehicles) {
		const routeId = getVehicleRouteId(vehicle);
		if (routeId !== undefined) {
			counts.set(routeId, (counts.get(routeId) ?? 0) + 1);
		}
	}
	const options = [...counts].map(([routeId, vehicleCount]) => ({
		routeId,
		route: routes.get(routeId),
		vehicleCount,
	}));
	// Lignes inconnues du GTFS théorique en dernier
	return options.sort((a, b) =>
		a.route && b.route
			? compareRoutes(a.route, b.route)
			: a.route
				? -1
				: b.route
					? 1
					: a.routeId.localeCompare(b.routeId),
	);
}

/** Nombre de véhicules correspondant à chaque filtre */
export function countVehicles(
	vehicles: Vehicle[],
): Record<VehicleFilter, number> {
	const tram = vehicles.filter((vehicle) => vehicle.kind === "tram").length;
	return { all: vehicles.length, tram, bus: vehicles.length - tram };
}

/** Nom de ligne à afficher : nom court du GTFS, sinon l'identifiant brut */
export function getLineLabel(vehicle: Vehicle): string {
	return vehicle.route?.shortName ?? vehicle.trip?.routeId ?? "?";
}
