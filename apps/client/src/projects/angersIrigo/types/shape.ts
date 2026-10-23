/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { MeasuredPath } from "./geo";

/** Arrêt desservi le long d'un tracé */
export type ShapeStop = {
	stopId: string;
	/** Distance depuis le début du tracé, en mètres */
	distance: number;
};

/** Tracé suivi par des courses (shapes.txt), avec leurs arrêts dans l'ordre de passage */
export type TripShape = {
	shapeId: string;
	stops: ShapeStop[];
} & MeasuredPath;

/** Contenu de src/data/shapes.json, généré par scripts/update-gtfs.ts */
export type ShapesFile = Record<
	string,
	{
		/** Points du tracé simplifié, encodés (voir utils/polyline.ts) */
		path: string;
		/** Arrêts dans l'ordre de passage, avec leur distance depuis le début du tracé (m) */
		stops: [stopId: string, distance: number][];
	}
>;
