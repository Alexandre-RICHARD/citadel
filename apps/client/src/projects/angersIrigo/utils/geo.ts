/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
// Géométrie à l'échelle d'une ville. Aucun import d'exécution : ce fichier sert aussi au script
// scripts/update-gtfs.ts, exécuté directement par Node.
import type { MeasuredPath, Point } from "../types/geo";

const EARTH_RADIUS_METERS = 6_371_000;
const DEGREES_TO_RADIANS = Math.PI / 180;

export function toPoint({
	latitude,
	longitude,
}: {
	latitude: number;
	longitude: number;
}): Point {
	return [latitude, longitude];
}

/**
 * Coordonnées en mètres de `point` dans un repère plan centré sur `origin` (x vers l'est, y vers
 * le nord). Projection équirectangulaire : largement assez précise sur quelques kilomètres.
 */
function toLocalMeters(origin: Point, point: Point): [x: number, y: number] {
	const meanLatitude = ((origin[0] + point[0]) / 2) * DEGREES_TO_RADIANS;
	return [
		(point[1] - origin[1]) *
			DEGREES_TO_RADIANS *
			Math.cos(meanLatitude) *
			EARTH_RADIUS_METERS,
		(point[0] - origin[0]) * DEGREES_TO_RADIANS * EARTH_RADIUS_METERS,
	];
}

export function distanceMeters(a: Point, b: Point): number {
	return Math.hypot(...toLocalMeters(a, b));
}

/** Cap de `from` vers `to`, en degrés dans le sens horaire depuis le nord (convention GTFS-RT) */
export function bearingDegrees(from: Point, to: Point): number {
	const [x, y] = toLocalMeters(from, to);
	return (Math.atan2(x, y) / DEGREES_TO_RADIANS + 360) % 360;
}

/**
 * Point du segment [a, b] le plus proche de `point` : `t` donne sa position sur le segment
 * (0 = a, 1 = b) et `offsetMeters` son écart avec `point`.
 */
export function projectOntoSegment(
	point: Point,
	a: Point,
	b: Point,
): { t: number; offsetMeters: number } {
	const [bx, by] = toLocalMeters(a, b);
	const [px, py] = toLocalMeters(a, point);
	const squaredLength = bx * bx + by * by;
	const t =
		squaredLength > 0
			? Math.min(1, Math.max(0, (px * bx + py * by) / squaredLength))
			: 0;
	return { t, offsetMeters: Math.hypot(px - t * bx, py - t * by) };
}

export function measurePath(points: Point[]): MeasuredPath {
	const distances = [0];
	for (let i = 1; i < points.length; i++) {
		distances.push(distances[i - 1] + distanceMeters(points[i - 1], points[i]));
	}
	return { points, distances };
}

export function getPathLength(path: MeasuredPath): number {
	return path.distances.at(-1) ?? 0;
}

/** Indice i du segment [i, i + 1] qui contient la distance donnée (recherche dichotomique) */
function findSegmentIndex(path: MeasuredPath, distance: number): number {
	let low = 0;
	let high = Math.max(0, path.points.length - 2);
	while (low < high) {
		const middle = Math.ceil((low + high) / 2);
		if (path.distances[middle] <= distance) {
			low = middle;
		} else {
			high = middle - 1;
		}
	}
	return low;
}

/** Point situé à une distance donnée du début du tracé, et cap du tracé à cet endroit */
export function pointAtDistance(
	path: MeasuredPath,
	distance: number,
): { point: Point; bearing: number } {
	const { points, distances } = path;
	if (points.length < 2) {
		return { point: points[0], bearing: 0 };
	}
	const i = findSegmentIndex(path, distance);
	const [a, b] = [points[i], points[i + 1]];
	const segmentLength = distances[i + 1] - distances[i];
	const t =
		segmentLength > 0
			? Math.min(1, Math.max(0, (distance - distances[i]) / segmentLength))
			: 0;
	return {
		point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
		bearing: bearingDegrees(a, b),
	};
}

/**
 * Distance le long du tracé du point le plus proche de `point`, en ne cherchant qu'entre les
 * distances `from` et `to` : un tracé peut repasser au même endroit (aller-retour, boucle).
 */
export function projectOntoPath(
	path: MeasuredPath,
	point: Point,
	from = 0,
	to = Infinity,
): { distance: number; offsetMeters: number } {
	const { points, distances } = path;
	let best = { distance: from, offsetMeters: Infinity };

	for (
		let i = findSegmentIndex(path, from);
		i < points.length - 1 && distances[i] <= to;
		i++
	) {
		const { t, offsetMeters } = projectOntoSegment(
			point,
			points[i],
			points[i + 1],
		);
		if (offsetMeters < best.offsetMeters) {
			const distance = distances[i] + t * (distances[i + 1] - distances[i]);
			best = { distance: Math.min(to, Math.max(from, distance)), offsetMeters };
		}
	}
	return best;
}

/** Portion du tracé comprise entre deux distances depuis son début */
export function slicePath(
	path: MeasuredPath,
	from: number,
	to: number,
): Point[] {
	const inner = path.points.filter(
		(_, i) => path.distances[i] > from && path.distances[i] < to,
	);
	return [
		pointAtDistance(path, from).point,
		...inner,
		pointAtDistance(path, to).point,
	];
}
