/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { GtfsStaticData } from "../types/gtfs-static";
import type { TripShape } from "../types/shape";
import type { Vehicle } from "../types/vehicle";
import { projectOntoPath, toPoint } from "./geo";

/** Marge autour du tronçon entre deux arrêts : la position GPS n'est jamais pile sur le tracé */
const SEARCH_MARGIN_METERS = 50;

/** Tracé suivi par une course, s'il est connu */
export function getTripShape(
	tripId: string | undefined,
	shapes: ReadonlyMap<string, TripShape>,
	gtfs: GtfsStaticData,
): TripShape | undefined {
	const shapeId =
		tripId !== undefined ? gtfs.trips.get(tripId)?.shapeId : undefined;
	return shapeId !== undefined ? shapes.get(shapeId) : undefined;
}

/**
 * Distance parcourue par le véhicule depuis le début de son tracé, en mètres. Un tracé peut
 * repasser au même endroit (aller-retour par la même rue, ligne circulaire) : on ne cherche
 * qu'entre l'arrêt précédent et celui vers lequel le véhicule se dirige.
 */
export function getDistanceAlongShape(
	shape: TripShape,
	vehicle: Pick<Vehicle, "position" | "stopId">,
): number {
	const point = toPoint(vehicle.position);
	// Un même arrêt peut figurer deux fois (départ et arrivée d'une ligne circulaire) : on essaie chaque tronçon
	const projections = shape.stops.flatMap((stop, index) => {
		if (stop.stopId !== vehicle.stopId) {
			return [];
		}
		const previousStopDistance =
			index > 0 ? shape.stops[index - 1].distance : 0;
		return [
			projectOntoPath(
				shape,
				point,
				previousStopDistance - SEARCH_MARGIN_METERS,
				stop.distance + SEARCH_MARGIN_METERS,
			),
		];
	});
	if (projections.length === 0) {
		projections.push(projectOntoPath(shape, point));
	}

	const closest = projections.reduce((best, projection) =>
		projection.offsetMeters < best.offsetMeters ? projection : best,
	);
	return Math.max(0, closest.distance);
}
