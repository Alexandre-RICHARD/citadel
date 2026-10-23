/* eslint-disable citadel/file-name-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { getMainDestinations } from "../utils/routes";
import { GTFS_STATIC } from "./gtfs-static";

/** Destination principale de chaque sens de chaque ligne, calculée une fois */
export const MAIN_DESTINATIONS = getMainDestinations(
	GTFS_STATIC.trips.values(),
);
