/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { GtfsRoute, GtfsTrip } from "../types/gtfs-static";

/** route_type désignant un tram */
const TRAM_ROUTE_TYPE = 0;

export function isTramRoute(route: GtfsRoute): boolean {
	return route.routeType === TRAM_ROUTE_TYPE;
}

/** Ordre d'affichage des lignes : trams d'abord, puis par nom ("2" avant "10") */
export function compareRoutes(a: GtfsRoute, b: GtfsRoute): number {
	const tramFirst = Number(isTramRoute(b)) - Number(isTramRoute(a));
	return (
		tramFirst || a.shortName.localeCompare(b.shortName, "fr", { numeric: true })
	);
}

/** Lignes de tram, triées par nom (A, B, C) */
export function getTramRoutes(
	routes: ReadonlyMap<string, GtfsRoute>,
): GtfsRoute[] {
	return [...routes.values()].filter(isTramRoute).sort(compareRoutes);
}

/** Destination principale de chaque sens de chaque ligne, indexée par directionKey() */
export type MainDestinations = ReadonlyMap<string, string>;

function directionKey(routeId: string, directionId: number): string {
	return `${routeId}/${directionId}`;
}

/**
 * Destination principale de chaque sens : la plus fréquente parmi les courses du sens.
 * Une ligne a aussi des courses partielles (ex : tram A → Verneau au lieu d'Avrillé-Ardenne).
 */
export function getMainDestinations(
	trips: Iterable<GtfsTrip>,
): MainDestinations {
	const countsByDirection = new Map<string, Map<string, number>>();
	for (const trip of trips) {
		if (!trip.headsign || trip.directionId === undefined) {
			continue;
		}
		const key = directionKey(trip.routeId, trip.directionId);
		const counts = countsByDirection.get(key) ?? new Map<string, number>();
		counts.set(trip.headsign, (counts.get(trip.headsign) ?? 0) + 1);
		countsByDirection.set(key, counts);
	}

	const mainDestinations = new Map<string, string>();
	for (const [key, counts] of countsByDirection) {
		const [mostFrequent] = [...counts].sort(
			([, countA], [, countB]) => countB - countA,
		);
		mainDestinations.set(key, mostFrequent[0]);
	}
	return mainDestinations;
}

/**
 * Libellé d'un sens : "Monplaisir → Belle-Beille Campus", c'est-à-dire la destination principale
 * du sens opposé, puis celle de ce sens. "→ Destination" si le sens opposé est inconnu.
 */
export function getDirectionLabel(
	mainDestinations: MainDestinations,
	routeId: string,
	directionId: number | undefined,
	fallbackDestination: string | undefined,
): string {
	if (directionId === undefined) {
		return `→ ${fallbackDestination ?? "Destination inconnue"}`;
	}
	const destination =
		mainDestinations.get(directionKey(routeId, directionId)) ??
		fallbackDestination;
	// GTFS : direction_id vaut 0 ou 1, l'autre sens est donc 1 - directionId
	const origin = mainDestinations.get(directionKey(routeId, 1 - directionId));
	if (origin && destination && origin !== destination) {
		return `${origin} → ${destination}`;
	}
	return `→ ${destination ?? "Destination inconnue"}`;
}

/** Destination principale d'un sens, pour repérer les courses partielles */
export function getMainDestination(
	mainDestinations: MainDestinations,
	routeId: string,
	directionId: number | undefined,
): string | undefined {
	return directionId === undefined
		? undefined
		: mainDestinations.get(directionKey(routeId, directionId));
}
