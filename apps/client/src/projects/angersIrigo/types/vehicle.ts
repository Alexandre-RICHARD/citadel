/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { Position, VehiclePosition } from "./gtfs-realtime";
import type { GtfsRoute, GtfsStop } from "./gtfs-static";

export type VehicleKind = "bus" | "tram";

/** Véhicules à afficher : tous, ou un seul mode */
export type VehicleFilter = "all" | VehicleKind;

/** Ligne proposée par le filtre des lignes */
export type LineOption = {
	routeId: string;
	/** Ligne du GTFS théorique, si elle y figure */
	route?: GtfsRoute | undefined;
	/** Véhicules de la ligne actuellement affichables */
	vehicleCount: number;
};

/** Arrivée prévue au terminus d'une course */
export type TerminusArrival =
	/** Heure prévue (s depuis l'epoch) */
	| { isBeyondForecast: false; time: number }
	/** Au-delà de l'horizon du flux, qui ne prévoit qu'environ une heure à l'avance */
	| { isBeyondForecast: true };

/** Véhicule affichable sur la carte : une position GTFS-RT, complétée par le GTFS théorique */
export type Vehicle = {
	/** Identifiant de l'entité dans le flux (FeedEntity.id), sert de clé React */
	entityId: string;
	position: Position;
	kind: VehicleKind;
	/** Ligne, si elle existe dans le GTFS théorique */
	route?: GtfsRoute | undefined;
	/** Destination de la course (trip_headsign), si la course existe dans le GTFS théorique */
	destination?: string | undefined;
	/** Arrêt courant (stopId), s'il existe dans le GTFS théorique */
	stop?: GtfsStop | undefined;
	/** Heure de passage prévue à `stop` (s depuis l'epoch), d'après les mises à jour de trajet */
	stopTime?: number | undefined;
	/** Arrivée prévue au terminus, si la course figure dans les mises à jour de trajet */
	terminusArrival?: TerminusArrival | undefined;
	/** Âge de la position par rapport à la génération du flux, en secondes */
	positionAgeSeconds?: number | undefined;
	/** Aucune nouvelle position depuis STALE_POSITION_SECONDS */
	isStale: boolean;
	/**
	 * Défini quand la position affichée est estimée par la simulation (voir utils/simulation.ts)
	 * plutôt que reçue : distance parcourue sur le tracé de la course, en mètres
	 */
	simulatedDistance?: number | undefined;
} & VehiclePosition;
