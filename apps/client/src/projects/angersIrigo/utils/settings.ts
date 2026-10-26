/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { Settings } from "../types/settings";
import type { VehicleFilter } from "../types/vehicle";

/** Clés du localStorage */
export const SETTINGS_STORAGE_KEY = "irigo-map:settings";
export const VEHICLE_FILTER_STORAGE_KEY = "irigo-map:vehicle-filter";
export const LINE_FILTER_STORAGE_KEY = "irigo-map:line-filter";
export const INFO_PANEL_COLLAPSED_STORAGE_KEY =
	"irigo-map:info-panel-collapsed";

export const DEFAULT_SETTINGS: Settings = {
	showStaleVehicles: false,
	showStops: true,
	simulateMovement: true,
};

/**
 * Reprend chaque réglage sauvegardé s'il est valide, sinon sa valeur par défaut.
 * Réglage par réglage : ajouter une option ne réinitialise pas les autres.
 */
export function sanitizeSettings(stored: unknown): Settings {
	const candidate =
		typeof stored === "object" && stored !== null
			? (stored as Record<string, unknown>)
			: {};
	function readBoolean(key: keyof Settings): boolean {
		const value = candidate[key];
		return typeof value === "boolean" ? value : DEFAULT_SETTINGS[key];
	}

	return {
		showStaleVehicles: readBoolean("showStaleVehicles"),
		showStops: readBoolean("showStops"),
		simulateMovement: readBoolean("simulateMovement"),
	};
}

/** Panneau d'infos replié ; déplié par défaut */
export function sanitizeCollapsed(stored: unknown): boolean {
	return stored === true;
}

export function sanitizeVehicleFilter(stored: unknown): VehicleFilter {
	return stored === "bus" || stored === "tram" ? stored : "all";
}

/** Identifiants de lignes choisies, sans doublon */
export function sanitizeLineFilter(stored: unknown): string[] {
	return Array.isArray(stored)
		? [
				...new Set(
					stored.filter(
						(routeId): routeId is string => typeof routeId === "string",
					),
				),
			]
		: [];
}
