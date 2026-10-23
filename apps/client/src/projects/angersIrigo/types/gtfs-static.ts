/* eslint-disable citadel/max-one-export, no-restricted-syntax, citadel/file-name-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
/**
 * Types des données du GTFS théorique utilisées par l'appli (sous-ensemble des colonnes).
 * Référence : https://gtfs.org/schedule/reference/
 */

/** Ligne (routes.txt) */
export type GtfsRoute = {
	routeId: string;
	/** Nom court affiché aux voyageurs, ex : "A", "12" */
	shortName: string;
	/** Nom long, ex : "Roseraie - Avrillé-Ardenne" */
	longName: string;
	/** Mode de transport : 0 = tram, 3 = bus… */
	routeType: number;
	/** Couleur de la ligne, au format CSS "#RRGGBB" */
	color?: string | undefined;
	/** Couleur du texte sur `color`, au format CSS "#RRGGBB" */
	textColor?: string | undefined;
};

/** Arrêt (stops.txt) */
export type GtfsStop = {
	stopId: string;
	/** Code court affiché aux arrêts */
	code?: string | undefined;
	name: string;
	latitude: number;
	longitude: number;
};

/** Course (trips.txt) : un passage d'un véhicule sur une ligne, à une heure donnée */
export type GtfsTrip = {
	tripId: string;
	routeId: string;
	/** Destination affichée sur le véhicule, ex : "AVRILLÉ Ardenne" */
	headsign?: string | undefined;
	/** Sens : 0 ou 1 */
	directionId?: number | undefined;
	/** Tracé suivi (shapes.txt, voir data/shapes.ts) */
	shapeId?: string | undefined;
};

/** Données théoriques indexées par identifiant */
export type GtfsStaticData = {
	routes: ReadonlyMap<string, GtfsRoute>;
	stops: ReadonlyMap<string, GtfsStop>;
	trips: ReadonlyMap<string, GtfsTrip>;
};
