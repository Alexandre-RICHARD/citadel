import type { ShapesFile, TripShape } from "../types/shape";
import { measurePath } from "../utils/geo";
import { decodePolyline } from "../utils/polyline";

function parseShapes(json: string): ReadonlyMap<string, TripShape> {
	// Fichier généré par scripts/update-gtfs.ts : son format est connu, d'où la conversion directe
	const file = JSON.parse(json) as ShapesFile;
	return new Map(
		Object.entries(file).map(([shapeId, { path, stops }]) => [
			shapeId,
			{
				shapeId,
				...measurePath(decodePolyline(path)),
				stops: stops.map(([stopId, distance]) => ({ stopId, distance })),
			},
		]),
	);
}

let shapesPromise: Promise<ReadonlyMap<string, TripShape>> | undefined;

/**
 * Tracés des courses, indexés par shapeId. Le fichier pèse ~400 Ko : il n'est chargé qu'à la
 * première demande (import dynamique, dont Vite fait un fichier à part), puis gardé en mémoire.
 */
export function loadShapes(): Promise<ReadonlyMap<string, TripShape>> {
	shapesPromise ??= import("./shapes.json?raw").then(
		(module) => parseShapes(module.default),
		(error: unknown) => {
			shapesPromise = undefined; // nouvel essai à la prochaine demande
			throw error;
		},
	);
	return shapesPromise;
}
