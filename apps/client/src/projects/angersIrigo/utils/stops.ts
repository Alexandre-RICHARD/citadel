/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { TripUpdate } from "../types/gtfs-realtime";
import type { GtfsRoute, GtfsStaticData, GtfsStop } from "../types/gtfs-static";
import type { TripShape } from "../types/shape";
import type { Departure, LineDepartures, StopGroup } from "../types/stop";
import { distanceMeters, toPoint } from "./geo";
import {
	compareRoutes,
	getDirectionLabel,
	getMainDestination,
	type MainDestinations,
} from "./routes";
import { findTerminusUpdate, getStopTime } from "./trip-updates";

/**
 * Deux quais de même nom plus éloignés que ça sont des arrêts homonymes de communes
 * différentes (ex : « Chevallerie », à 19 km d'écart) et ne sont pas regroupés.
 */
const MAX_GROUP_RADIUS_METERS = 300;

/** Un passage annoncé reste affiché un court instant après son heure prévue */
const DEPARTURE_GRACE_SECONDS = 30;

function average(values: number[]): number {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toStopGroup(members: GtfsStop[]): StopGroup {
	return {
		id: members[0].stopId,
		name: members[0].name,
		stopIds: new Set(members.map((stop) => stop.stopId)),
		latitude: average(members.map((stop) => stop.latitude)),
		longitude: average(members.map((stop) => stop.longitude)),
	};
}

/** Regroupe les quais de même nom et proches (voir MAX_GROUP_RADIUS_METERS) */
export function groupStops(stops: Iterable<GtfsStop>): StopGroup[] {
	const clustersByName = new Map<string, GtfsStop[][]>();

	for (const stop of stops) {
		const clusters = clustersByName.get(stop.name) ?? [];
		const nearbyCluster = clusters.find(
			(cluster) =>
				distanceMeters(toPoint(cluster[0]), toPoint(stop)) <=
				MAX_GROUP_RADIUS_METERS,
		);
		if (nearbyCluster) {
			nearbyCluster.push(stop);
		} else {
			clusters.push([stop]);
		}
		clustersByName.set(stop.name, clusters);
	}

	return [...clustersByName.values()].flat().map(toStopGroup);
}

/**
 * Prochains passages à un arrêt, triés par heure. Limités à l'heure à venir :
 * le flux des mises à jour de trajet ne prévoit pas plus loin.
 */
export function getDepartures(
	stopIds: ReadonlySet<string>,
	tripUpdates: ReadonlyMap<string, TripUpdate>,
	gtfs: GtfsStaticData,
	nowSeconds: number,
): Departure[] {
	const departures: Departure[] = [];

	for (const [tripId, tripUpdate] of tripUpdates) {
		const stopTimeUpdate = tripUpdate.stopTimeUpdate?.find(
			(update) => update.stopId !== undefined && stopIds.has(update.stopId),
		);
		if (!stopTimeUpdate || stopTimeUpdate.scheduleRelationship === "SKIPPED") {
			continue;
		}
		const time = getStopTime(stopTimeUpdate);
		if (time === undefined || time < nowSeconds - DEPARTURE_GRACE_SECONDS) {
			continue;
		}

		const trip = gtfs.trips.get(tripId);
		const routeId = tripUpdate.trip.routeId ?? trip?.routeId;
		if (routeId === undefined) {
			continue;
		}
		const destination = trip?.headsign;
		const terminusUpdate = destination
			? findTerminusUpdate(tripUpdate, destination, gtfs.stops)
			: undefined;

		departures.push({
			tripId,
			routeId,
			route: gtfs.routes.get(routeId),
			directionId: tripUpdate.trip.directionId ?? trip?.directionId,
			destination,
			time,
			isArrival: terminusUpdate === stopTimeUpdate,
		});
	}

	return departures.sort((a, b) => a.time - b.time);
}

/**
 * Range les passages (triés par heure) par ligne puis par sens, en gardant les
 * `limitPerDirection` premiers de chaque sens. Lignes triées trams d'abord.
 */
export function groupDeparturesByLine(
	departures: Departure[],
	mainDestinations: MainDestinations,
	limitPerDirection: number,
): LineDepartures[] {
	// Map : conserve l'ordre d'insertion, donc l'ordre chronologique des passages
	const byLine = new Map<string, Map<number | undefined, Departure[]>>();
	for (const departure of departures) {
		const byDirection =
			byLine.get(departure.routeId) ??
			new Map<number | undefined, Departure[]>();
		const directionDepartures = byDirection.get(departure.directionId) ?? [];
		if (directionDepartures.length < limitPerDirection) {
			directionDepartures.push(departure);
		}
		byDirection.set(departure.directionId, directionDepartures);
		byLine.set(departure.routeId, byDirection);
	}

	const lines = [...byLine].map(([routeId, byDirection]): LineDepartures => {
		const directions = [...byDirection]
			// Sens 0 puis sens 1, pour que les colonnes gardent la même place d'un arrêt à l'autre
			.sort(
				([directionA], [directionB]) => (directionA ?? 0) - (directionB ?? 0),
			)
			.map(([directionId, directionDepartures]) => ({
				directionId,
				label: getDirectionLabel(
					mainDestinations,
					routeId,
					directionId,
					directionDepartures[0].destination,
				),
				mainDestination: getMainDestination(
					mainDestinations,
					routeId,
					directionId,
				),
				departures: directionDepartures,
			}));
		return { routeId, route: directions[0].departures[0].route, directions };
	});

	// Lignes inconnues du GTFS théorique en dernier
	return lines.sort((a, b) =>
		a.route && b.route ? compareRoutes(a.route, b.route) : a.route ? -1 : 1,
	);
}

/**
 * Lignes qui desservent chaque arrêt (indexé par id), d'après les tracés des courses, trams d'abord.
 * Les horaires théoriques (stop_times.txt) ne sont pas embarqués : les tracés en sont le résumé.
 */
export function getRoutesByStop(
	shapes: ReadonlyMap<string, TripShape>,
	gtfs: GtfsStaticData,
	stopGroupByStopId: ReadonlyMap<string, StopGroup>,
): ReadonlyMap<string, GtfsRoute[]> {
	// Toutes les courses d'un même tracé sont sur la même ligne
	const routeIdByShapeId = new Map<string, string>();
	for (const trip of gtfs.trips.values()) {
		if (trip.shapeId !== undefined) {
			routeIdByShapeId.set(trip.shapeId, trip.routeId);
		}
	}

	const routeIdsByStop = new Map<string, Set<string>>();
	for (const [shapeId, routeId] of routeIdByShapeId) {
		for (const { stopId } of shapes.get(shapeId)?.stops ?? []) {
			const group = stopGroupByStopId.get(stopId);
			if (group) {
				const routeIds = routeIdsByStop.get(group.id) ?? new Set<string>();
				routeIdsByStop.set(group.id, routeIds.add(routeId));
			}
		}
	}

	const routesByStop = new Map<string, GtfsRoute[]>();
	for (const [stopId, routeIds] of routeIdsByStop) {
		const routes = [...routeIds].flatMap(
			(routeId) => gtfs.routes.get(routeId) ?? [],
		);
		routesByStop.set(stopId, routes.sort(compareRoutes));
	}
	return routesByStop;
}
