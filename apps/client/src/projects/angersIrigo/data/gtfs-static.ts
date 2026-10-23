/* eslint-disable citadel/file-name-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
// Extraits du GTFS théorique d'Irigo, embarqués dans l'appli (mis à jour par `pnpm update-gtfs`).
// Le flux temps réel ne donne que des identifiants : ces fichiers fournissent noms, couleurs,
// modes et destinations. `?raw` : Vite importe le contenu des fichiers sous forme de chaîne.
import type {
	GtfsRoute,
	GtfsStaticData,
	GtfsStop,
	GtfsTrip,
} from "../types/gtfs-static";
import { parseCsv } from "../utils/csv";
import routesCsv from "./routes.txt?raw";
import stopsCsv from "./stops.txt?raw";
import tripsCsv from "./trips.txt?raw";

/** "E30613" → "#E30613" ; ignore toute valeur qui n'est pas une couleur hexadécimale */
function toCssColor(hex: string): string | undefined {
	return /^[0-9a-f]{6}$/i.test(hex) ? `#${hex}` : undefined;
}

function toRoute(row: Record<string, string>): GtfsRoute {
	return {
		routeId: row.route_id,
		shortName: row.route_short_name,
		longName: row.route_long_name,
		routeType: Number(row.route_type),
		color: toCssColor(row.route_color),
		textColor: toCssColor(row.route_text_color),
	};
}

function toStop(row: Record<string, string>): GtfsStop {
	return {
		stopId: row.stop_id,
		code: row.stop_code || undefined,
		name: row.stop_name,
		latitude: Number(row.stop_lat),
		longitude: Number(row.stop_lon),
	};
}

function toTrip(row: Record<string, string>): GtfsTrip {
	return {
		tripId: row.trip_id,
		routeId: row.route_id,
		headsign: row.trip_headsign || undefined,
		directionId: row.direction_id ? Number(row.direction_id) : undefined,
		shapeId: row.shape_id || undefined,
	};
}

/** Lignes, arrêts et courses, indexés par identifiant (lus une fois, au chargement du module) */
export const GTFS_STATIC: GtfsStaticData = {
	routes: new Map(
		parseCsv(routesCsv).map((row) => [row.route_id, toRoute(row)]),
	),
	stops: new Map(parseCsv(stopsCsv).map((row) => [row.stop_id, toStop(row)])),
	trips: new Map(parseCsv(tripsCsv).map((row) => [row.trip_id, toTrip(row)])),
};
