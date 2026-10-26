/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
// Simulation « optimiste » : entre deux positions reçues (une par minute), chaque véhicule
// avance le long du tracé de sa course au rythme des heures de passage prévues à ses
// prochains arrêts. Chaque nouvelle position reçue recale la simulation.
import type { Point } from "../types/geo";
import type { TripUpdate } from "../types/gtfs-realtime";
import type { GtfsStaticData } from "../types/gtfs-static";
import type { TripShape } from "../types/shape";
import type { Vehicle } from "../types/vehicle";
import { pointAtDistance } from "./geo";
import { getDistanceAlongShape, getTripShape } from "./shapes";

/** Un véhicule à moins de ça d'un arrêt y est considéré comme arrêté (attente du départ) */
const AT_STOP_METERS = 30;

/**
 * Le cap ne sert qu'à orienter la flèche du marqueur : l'arrondir évite de recréer l'icône
 * (voir VehicleMarker) à chaque léger virage du tracé.
 */
const BEARING_STEP_DEGREES = 10;

/** Étape du trajet prévu : à l'heure `time` (s depuis l'epoch), le véhicule est à `distance` m du début du tracé */
type Waypoint = {
	time: number;
	distance: number;
};

/** Trajet prévu d'un véhicule : des étapes à heures croissantes le long du tracé de sa course */
export type VehicleMotion = {
	shape: TripShape;
	waypoints: Waypoint[];
};

/** Passage prévu à un arrêt de la course, placé sur son tracé (heures en s depuis l'epoch) */
type StopForecast = {
	distance: number;
	arrival: number;
	departure: number;
};

/** Prévisions du flux placées sur le tracé, dans l'ordre (y compris les arrêts tout juste desservis) */
function getStopForecasts(
	tripUpdate: TripUpdate,
	shape: TripShape,
): StopForecast[] {
	const forecasts: StopForecast[] = [];
	// Les arrêts sont cherchés dans l'ordre du tracé : un même arrêt peut y figurer deux fois
	let nextShapeStopIndex = 0;

	for (const update of tripUpdate.stopTimeUpdate ?? []) {
		const shapeStopIndex = shape.stops.findIndex(
			(shapeStop, index) =>
				index >= nextShapeStopIndex && shapeStop.stopId === update.stopId,
		);
		const arrival = update.arrival?.time ?? update.departure?.time;
		const departure = update.departure?.time ?? arrival;
		if (
			shapeStopIndex === -1 ||
			update.scheduleRelationship === "SKIPPED" ||
			!arrival ||
			!departure
		) {
			continue;
		}
		nextShapeStopIndex = shapeStopIndex + 1;
		forecasts.push({
			distance: shape.stops[shapeStopIndex].distance,
			arrival,
			departure,
		});
	}
	return forecasts;
}

/**
 * Heures auxquelles les prévisions placent le véhicule à une distance donnée : entre l'arrivée
 * et le départ s'il s'agit d'un arrêt, sinon par interpolation entre les deux arrêts qui
 * l'encadrent. Inconnues si aucun arrêt prévu ne précède cette distance.
 */
function getForecastTimesAt(
	forecasts: StopForecast[],
	distance: number,
): [earliest: number, latest: number] | undefined {
	const stop = forecasts.find(
		(forecast) => Math.abs(forecast.distance - distance) < AT_STOP_METERS,
	);
	if (stop) {
		return [stop.arrival, stop.departure];
	}
	const nextIndex = forecasts.findIndex(
		(forecast) => forecast.distance > distance,
	);
	if (nextIndex <= 0) {
		return undefined;
	}
	const [before, after] = [forecasts[nextIndex - 1], forecasts[nextIndex]];
	const progress =
		(distance - before.distance) / (after.distance - before.distance);
	const time = before.departure + (after.arrival - before.departure) * progress;
	return [time, time];
}

/**
 * Trajet prévu à partir de la dernière position reçue : rejoindre chaque arrêt à venir à son
 * heure d'arrivée prévue, y rester jusqu'à son heure de départ.
 *
 * Les prévisions d'Irigo ne bougent pas d'une minute à l'autre : un véhicule en retard le
 * reste. On mesure donc son retard à sa position réelle et on décale d'autant ses prochains passages.
 */
export function planMotion(
	vehicle: Vehicle,
	tripUpdate: TripUpdate,
	shape: TripShape,
): VehicleMotion | undefined {
	if (vehicle.timestamp === undefined) {
		return undefined;
	}
	const start: Waypoint = {
		time: vehicle.timestamp,
		distance: getDistanceAlongShape(shape, vehicle),
	};
	const forecasts = getStopForecasts(tripUpdate, shape);

	// Retard (positif) ou avance (négatif) sur les prévisions, nul si le véhicule est dans les temps
	const forecastTimes = getForecastTimesAt(forecasts, start.distance);
	const delay = forecastTimes
		? start.time -
			Math.min(Math.max(start.time, forecastTimes[0]), forecastTimes[1])
		: 0;

	const waypoints = [start];
	for (const forecast of forecasts) {
		const { distance } = forecast;
		const [arrival, departure] = [
			forecast.arrival + delay,
			forecast.departure + delay,
		];
		const previous = waypoints[waypoints.length - 1];

		if (distance <= previous.distance) {
			// Arrêt atteint ou dépassé : s'il est tout proche et que son départ est à venir, on l'attend
			if (
				previous.distance - distance < AT_STOP_METERS &&
				departure > previous.time
			) {
				waypoints.push({ time: departure, distance: previous.distance });
			}
			continue;
		}
		// Une heure d'arrivée déjà passée (retard mal estimé) est ignorée : on vise le départ, ou l'arrêt suivant
		if (arrival > previous.time) {
			waypoints.push({ time: arrival, distance });
		}
		if (departure > waypoints[waypoints.length - 1].time) {
			waypoints.push({ time: departure, distance });
		}
	}

	return waypoints.length > 1 ? { shape, waypoints } : undefined;
}

/** Distance parcourue à l'instant donné (s depuis l'epoch), par interpolation entre les étapes */
function getDistanceAt(
	{ waypoints }: VehicleMotion,
	nowSeconds: number,
): number {
	const nextIndex = waypoints.findIndex(
		(waypoint) => waypoint.time > nowSeconds,
	);
	if (nextIndex === -1) {
		return waypoints[waypoints.length - 1].distance; // trajet prévu terminé : on reste au dernier arrêt
	}
	if (nextIndex === 0) {
		return waypoints[0].distance; // horloge du navigateur en retard sur celle du flux
	}
	const [from, to] = [waypoints[nextIndex - 1], waypoints[nextIndex]];
	const progress = (nowSeconds - from.time) / (to.time - from.time);
	return from.distance + (to.distance - from.distance) * progress;
}

/** Repère de temps : où le trajet prévu place le véhicule `minutes` min après l'instant de référence */
export type TimeMarker = {
	minutes: number;
	point: Point;
};

/**
 * Repères toutes les `intervalMinutes` à partir de `fromSeconds` (s depuis l'epoch), jusqu'à la
 * fin du trajet prévu : au-delà, les prévisions du flux ne disent plus rien.
 */
export function getTimeMarkers(
	motion: VehicleMotion,
	fromSeconds: number,
	intervalMinutes: number,
): TimeMarker[] {
	const lastTime = motion.waypoints[motion.waypoints.length - 1].time;
	const markers: TimeMarker[] = [];
	for (
		let minutes = intervalMinutes;
		intervalMinutes > 0 && fromSeconds + minutes * 60 <= lastTime;
		minutes += intervalMinutes
	) {
		const distance = getDistanceAt(motion, fromSeconds + minutes * 60);
		markers.push({
			minutes,
			point: pointAtDistance(motion.shape, distance).point,
		});
	}
	return markers;
}

/** Trajets prévus des véhicules simulables, indexés par entityId */
export function planMotions(
	vehicles: Vehicle[],
	tripUpdates: ReadonlyMap<string, TripUpdate>,
	shapes: ReadonlyMap<string, TripShape>,
	gtfs: GtfsStaticData,
): ReadonlyMap<string, VehicleMotion> {
	const motions = new Map<string, VehicleMotion>();
	for (const vehicle of vehicles) {
		const tripId = vehicle.trip?.tripId;
		const tripUpdate =
			tripId !== undefined ? tripUpdates.get(tripId) : undefined;
		const shape = getTripShape(tripId, shapes, gtfs);
		// Un véhicule sans signal depuis longtemps n'est pas simulé : il est sans doute au dépôt
		const motion =
			!vehicle.isStale && tripUpdate && shape
				? planMotion(vehicle, tripUpdate, shape)
				: undefined;
		if (motion) {
			motions.set(vehicle.entityId, motion);
		}
	}
	return motions;
}

/** Remplace la position reçue des véhicules simulables par leur position estimée à l'instant donné */
export function simulateVehicles(
	vehicles: Vehicle[],
	motions: ReadonlyMap<string, VehicleMotion>,
	nowSeconds: number,
): Vehicle[] {
	return vehicles.map((vehicle) => {
		const motion = motions.get(vehicle.entityId);
		if (!motion) {
			return vehicle;
		}
		const simulatedDistance = getDistanceAt(motion, nowSeconds);
		const { point, bearing } = pointAtDistance(motion.shape, simulatedDistance);
		return {
			...vehicle,
			position: {
				...vehicle.position,
				latitude: point[0],
				longitude: point[1],
				bearing:
					(Math.round(bearing / BEARING_STEP_DEGREES) * BEARING_STEP_DEGREES) %
					360,
			},
			simulatedDistance,
		};
	});
}
