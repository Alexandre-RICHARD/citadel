/* eslint-disable citadel/max-one-export, citadel/file-name-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { StopGroup } from "../types/stop";
import { groupStops } from "../utils/stops";
import { GTFS_STATIC } from "./gtfs-static";

/** Arrêts tels qu'affichés : quais de même nom et proches regroupés */
export const STOP_GROUPS = groupStops(GTFS_STATIC.stops.values());

/** Arrêt affiché auquel appartient chaque quai (stopId du GTFS) */
export const STOP_GROUP_BY_STOP_ID: ReadonlyMap<string, StopGroup> = new Map(
	STOP_GROUPS.flatMap((group) =>
		[...group.stopIds].map((stopId): [string, StopGroup] => [stopId, group]),
	),
);
