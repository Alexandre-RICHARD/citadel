/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
// Encodage « polyline » de Google : une suite de points écrite en texte compact. Chaque
// coordonnée est l'écart avec le point précédent, en 1e-5 degré (~1 m), codé en base 64 sur une
// longueur variable. Spec : https://developers.google.com/maps/documentation/utilities/polylinealgorithm
// Aucun import d'exécution : ce fichier sert aussi au script scripts/update-gtfs.ts.
import type { Point } from "../types/geo";

const PRECISION = 1e5;
const CHUNK_BITS = 5;
const CHUNK_MASK = 0x1f;
/** Bit ajouté à chaque morceau de 5 bits sauf le dernier */
const CONTINUATION_BIT = 0x20;
/** Décalage qui rend chaque morceau imprimable (63 = '?') */
const ASCII_OFFSET = 63;

function encodeValue(value: number): string {
	// Le signe passe dans le bit de poids faible : les petits écarts négatifs restent courts
	let rest = value < 0 ? ~(value << 1) : value << 1;
	let encoded = "";
	while (rest >= CONTINUATION_BIT) {
		encoded += String.fromCharCode(
			(CONTINUATION_BIT | (rest & CHUNK_MASK)) + ASCII_OFFSET,
		);
		rest >>= CHUNK_BITS;
	}
	return encoded + String.fromCharCode(rest + ASCII_OFFSET);
}

export function encodePolyline(points: Point[]): string {
	let encoded = "";
	let [previousLatitude, previousLongitude] = [0, 0];
	for (const [latitude, longitude] of points) {
		const [roundedLatitude, roundedLongitude] = [
			Math.round(latitude * PRECISION),
			Math.round(longitude * PRECISION),
		];
		encoded +=
			encodeValue(roundedLatitude - previousLatitude) +
			encodeValue(roundedLongitude - previousLongitude);
		[previousLatitude, previousLongitude] = [roundedLatitude, roundedLongitude];
	}
	return encoded;
}

export function decodePolyline(encoded: string): Point[] {
	const points: Point[] = [];
	let index = 0;

	function readValue(): number {
		let value = 0;
		let shift = 0;
		let chunk: number;
		do {
			chunk = encoded.charCodeAt(index++) - ASCII_OFFSET;
			value |= (chunk & CHUNK_MASK) << shift;
			shift += CHUNK_BITS;
		} while (chunk >= CONTINUATION_BIT);
		return value & 1 ? ~(value >> 1) : value >> 1;
	}

	let [latitude, longitude] = [0, 0];
	while (index < encoded.length) {
		latitude += readValue();
		longitude += readValue();
		points.push([latitude / PRECISION, longitude / PRECISION]);
	}
	return points;
}
