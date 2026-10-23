/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { GtfsRoute } from "./gtfs-static";

/**
 * Arrêt tel qu'affiché sur la carte : les quais de même nom et proches regroupés
 * (en général un quai par sens).
 */
export type StopGroup = {
	/** stop_id du premier quai, stable d'un chargement à l'autre */
	id: string;
	name: string;
	stopIds: ReadonlySet<string>;
	/** Centre des quais */
	latitude: number;
	longitude: number;
};

/**
 * Demande de centrer la carte sur un arrêt et d'ouvrir sa popup. Un nouvel objet à chaque
 * demande, pour qu'elle soit traitée même si l'arrêt est le même que la fois précédente.
 */
export type StopFocusRequest = {
	stop: StopGroup;
};

/** Passage prévu d'une course à un arrêt */
export type Departure = {
	/** Une course ne passe qu'une fois par arrêt : sert de clé React */
	tripId: string;
	routeId: string;
	route?: GtfsRoute | undefined;
	/** Sens : 0 ou 1 */
	directionId?: number | undefined;
	destination?: string | undefined;
	/** Heure prévue (s depuis l'epoch) */
	time: number;
	/** L'arrêt est le terminus de la course : le véhicule y arrive sans repartir */
	isArrival: boolean;
};

/** Prochains passages d'un sens d'une ligne */
export type DirectionDepartures = {
	directionId?: number | undefined;
	/** "Monplaisir → Belle-Beille Campus" */
	label: string;
	/** Destination habituelle du sens : les passages qui en diffèrent sont des courses partielles */
	mainDestination?: string | undefined;
	departures: Departure[];
};

/** Prochains passages d'une ligne à un arrêt, sens par sens */
export type LineDepartures = {
	routeId: string;
	route?: GtfsRoute | undefined;
	directions: DirectionDepartures[];
};
