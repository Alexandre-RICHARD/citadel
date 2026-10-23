/* eslint-disable citadel/max-one-export, citadel/file-name-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type {
	FeedMessage,
	StopTimeUpdate,
	TripUpdate,
} from "../types/gtfs-realtime";
import type { GtfsStop } from "../types/gtfs-static";
import type { TerminusArrival } from "../types/vehicle";

/**
 * Le flux prévoit environ une heure à l'avance : les prévisions des courses qu'il coupe
 * s'arrêtent entre 53 et 60 min (mesuré). Plus tôt, elles sont simplement incomplètes.
 */
const MIN_FORECAST_HORIZON_SECONDS = 45 * 60;

/** Mises à jour de trajet du flux, indexées par course (tripId) */
export function indexTripUpdates(
	feed: FeedMessage | undefined,
): ReadonlyMap<string, TripUpdate> {
	const tripUpdates = new Map<string, TripUpdate>();
	for (const entity of feed?.entity ?? []) {
		const tripId = entity.tripUpdate?.trip.tripId;
		if (entity.tripUpdate && tripId !== undefined) {
			tripUpdates.set(tripId, entity.tripUpdate);
		}
	}
	return tripUpdates;
}

/** Heure de passage prévue à un arrêt (s depuis l'epoch) : l'arrivée, sinon le départ */
export function getStopTime(
	stopTimeUpdate: StopTimeUpdate,
): number | undefined {
	return stopTimeUpdate.arrival?.time ?? stopTimeUpdate.departure?.time;
}

/** Heure de passage prévue à un arrêt donné de la course, s'il est desservi */
export function findStopTime(
	tripUpdate: TripUpdate,
	stopId: string,
): number | undefined {
	const stopTimeUpdate = tripUpdate.stopTimeUpdate?.find(
		(update) => update.stopId === stopId,
	);
	if (!stopTimeUpdate || stopTimeUpdate.scheduleRelationship === "SKIPPED") {
		return undefined;
	}
	return getStopTime(stopTimeUpdate);
}

/** "Avrillé-Ardenne" → "avrille ardenne" */
function normalizeName(name: string): string {
	return name
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "") // accents
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

/**
 * Passage prévu au terminus de la course, si le flux va jusque-là.
 *
 * Le flux ne prévoit qu'environ une heure à l'avance : son dernier arrêt pour une course n'est
 * pas forcément le terminus. Faute des horaires théoriques complets (stop_times.txt, 14 Mo),
 * on le reconnaît à son nom, contenu dans la destination de la course : "ANGERS Lorraine" ↔
 * "Lorraine". Juste pour 224 courses sur 228 mesurées ; en cas de doute, renvoie undefined.
 */
export function findTerminusUpdate(
	tripUpdate: TripUpdate,
	destination: string,
	stops: ReadonlyMap<string, GtfsStop>,
): StopTimeUpdate | undefined {
	const lastUpdate = tripUpdate.stopTimeUpdate?.at(-1);
	const lastStopName =
		lastUpdate?.stopId !== undefined
			? stops.get(lastUpdate.stopId)?.name
			: undefined;
	if (!lastUpdate || !lastStopName) {
		return undefined;
	}
	return normalizeName(destination).includes(normalizeName(lastStopName))
		? lastUpdate
		: undefined;
}

/** Heure d'arrivée prévue au terminus (s depuis l'epoch), si le flux la connaît */
export function findTerminusTime(
	tripUpdate: TripUpdate,
	destination: string,
	stops: ReadonlyMap<string, GtfsStop>,
): number | undefined {
	const terminusUpdate = findTerminusUpdate(tripUpdate, destination, stops);
	return terminusUpdate ? getStopTime(terminusUpdate) : undefined;
}

/**
 * Arrivée prévue au terminus, dont on connaît l'arrêt (le dernier du tracé de la course).
 * `referenceTime` : heure de génération du flux (s depuis l'epoch), pour mesurer son horizon.
 */
export function findTerminusArrival(
	tripUpdate: TripUpdate,
	terminusStopId: string,
	referenceTime: number,
): TerminusArrival | undefined {
	const forecasts = (tripUpdate.stopTimeUpdate ?? []).flatMap((update) => {
		const time = getStopTime(update);
		return update.scheduleRelationship !== "SKIPPED" && time !== undefined
			? [{ stopId: update.stopId, time }]
			: [];
	});
	const terminusForecast = forecasts.find(
		(forecast) => forecast.stopId === terminusStopId,
	);
	if (terminusForecast) {
		return { isBeyondForecast: false, time: terminusForecast.time };
	}
	// Terminus absent : si les prévisions vont jusqu'à l'horizon du flux, il est au-delà
	const lastForecast = forecasts.at(-1);
	const reachesHorizon =
		lastForecast !== undefined &&
		lastForecast.time - referenceTime >= MIN_FORECAST_HORIZON_SECONDS;
	return reachesHorizon ? { isBeyondForecast: true } : undefined;
}
