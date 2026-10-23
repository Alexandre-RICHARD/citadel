/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
/** Point géographique : [latitude, longitude] en degrés, comme les LatLngTuple de Leaflet */
export type Point = [latitude: number, longitude: number];

/** Ligne brisée dont on connaît la distance parcourue à chaque point */
export type MeasuredPath = {
	points: Point[];
	/** Distance de chaque point depuis le début, en mètres (autant d'éléments que `points`) */
	distances: number[];
};
