/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { VehicleStopStatus } from "../types/gtfs-realtime";

const timeFormatter = new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" });
const clockFormatter = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" });
const relativeTimeFormatter = new Intl.RelativeTimeFormat("fr", {
	numeric: "auto",
	style: "short",
});

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** "11:42:07" */
export function formatTime(date: Date): string {
	return timeFormatter.format(date);
}

/*
 * Pour les passages prévus ci-dessous :
 * - timeSeconds : heure prévue, en s depuis l'epoch (format GTFS-RT)
 * - now : heure courante, en ms depuis l'epoch (format Date.now())
 */

/** "11:52" */
export function formatClock(timeSeconds: number): string {
	return clockFormatter.format(new Date(timeSeconds * 1000));
}

function getMinutesUntil(timeSeconds: number, now: number): number {
	return Math.round((timeSeconds * 1000 - now) / 60_000);
}

/** Version courte pour les listes : "3 min", "à l'approche" */
export function formatDelay(timeSeconds: number, now: number): string {
	const minutes = getMinutesUntil(timeSeconds, now);
	return minutes <= 0 ? "à l'approche" : `${minutes} min`;
}

/** "dans 3 min (11:52)", "à l'approche (11:49)" */
export function formatEta(timeSeconds: number, now: number): string {
	const minutes = getMinutesUntil(timeSeconds, now);
	const delay = minutes <= 0 ? "à l'approche" : `dans ${minutes} min`;
	return `${delay} (${formatClock(timeSeconds)})`;
}

/** "maintenant", "il y a 45 s", "il y a 3 min", "il y a 2 h" */
export function formatAge(seconds: number): string {
	if (seconds < SECONDS_PER_MINUTE) {
		return relativeTimeFormatter.format(-Math.round(seconds), "second");
	}
	if (seconds < SECONDS_PER_HOUR) {
		return relativeTimeFormatter.format(
			-Math.floor(seconds / SECONDS_PER_MINUTE),
			"minute",
		);
	}
	return relativeTimeFormatter.format(
		-Math.floor(seconds / SECONDS_PER_HOUR),
		"hour",
	);
}

/** Sens de stopId selon le statut ; la spec prévoit IN_TRANSIT_TO quand le statut est absent */
export const STOP_STATUS_LABELS: Record<VehicleStopStatus, string> = {
	INCOMING_AT: "Arrive à",
	STOPPED_AT: "À l'arrêt",
	IN_TRANSIT_TO: "Prochain arrêt",
};
