/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./FeedStatusLine.scss";

import type { JSX } from "react";

import { useNow } from "../hooks/useNow";
import type { LoadStatus } from "../types/load-status";
import { formatAge, formatTime } from "../utils/format";

const TICK_INTERVAL_MS = 1000;
const SECONDS_PER_HOUR = 3600;

type FeedStatusLineProps = {
	status: LoadStatus;
	updatedAt?: Date | undefined;
};

/** "11:42:07 (il y a 48 s)" ; en heures au-delà d'une heure */
function formatUpdate(updatedAt: Date, now: number): string {
	// Clamp à 0 : l'horloge du navigateur peut être un peu en retard sur celle du serveur
	const ageSeconds = Math.max(
		0,
		Math.round((now - updatedAt.getTime()) / 1000),
	);
	const age =
		ageSeconds < SECONDS_PER_HOUR
			? `il y a ${ageSeconds} s`
			: formatAge(ageSeconds);
	return `${formatTime(updatedAt)} (${age})`;
}

function getStatusMessage(
	status: LoadStatus,
	updatedAt: Date | undefined,
	now: number,
): string {
	switch (status) {
		case "loading":
			return "Connexion au flux…";
		case "success":
			return updatedAt
				? `Mis à jour : ${formatUpdate(updatedAt, now)}`
				: "En direct";
		default:
			return updatedAt
				? `Connexion perdue · mis à jour : ${formatUpdate(updatedAt, now)}`
				: "Impossible de récupérer les positions";
	}
}

/** État du flux avec l'âge des données, mis à jour chaque seconde */
export function FeedStatusLine({
	status,
	updatedAt,
}: FeedStatusLineProps): JSX.Element {
	// Seul ce composant se re-rend chaque seconde, pas la carte
	const now = useNow(TICK_INTERVAL_MS);

	return (
		<p
			className={`feed-status feed-status--${status}`}
			role="status"
		>
			{getStatusMessage(status, updatedAt, now)}
		</p>
	);
}
