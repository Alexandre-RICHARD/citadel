/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./FavoritesPanel.scss";

import { type JSX, memo, useId, useState } from "react";

import { MOBILE_MEDIA_QUERY } from "../config";
import { GTFS_STATIC } from "../data/gtfs-static";
import { MAIN_DESTINATIONS } from "../data/main-destinations";
import { STOP_GROUP_BY_STOP_ID } from "../data/stop-groups";
import { useNow } from "../hooks/useNow";
import type { Favorite } from "../types/favorite";
import type { TripUpdate } from "../types/gtfs-realtime";
import type { LoadStatus } from "../types/load-status";
import type { StopGroup } from "../types/stop";
import { formatDelay } from "../utils/format";
import { getMainDestination } from "../utils/routes";
import { getDepartures } from "../utils/stops";
import { withViewTransition } from "../utils/viewTransition";
import { LineBadge } from "./LineBadge";
import { StarIcon } from "./StarIcon";

const DEPARTURES_PER_FAVORITE = 2;
/** Les délais sont en minutes : les recalculer toutes les 30 s suffit */
const REFRESH_INTERVAL_MS = 30_000;

function isMobile(): boolean {
	return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

/** Texte à la place des passages tant que le flux n'a jamais répondu : « Aucun passage » serait trompeur */
function getUnavailableText(
	tripUpdates: ReadonlyMap<string, TripUpdate>,
	status: LoadStatus,
): string | undefined {
	if (tripUpdates.size > 0) {
		return undefined;
	}
	if (status === "loading") {
		return "Chargement…";
	}
	return status === "error" ? "Horaires indisponibles" : undefined;
}

function CollapseIcon(): JSX.Element {
	return (
		<svg
			viewBox="0 0 24 24"
			width="18"
			height="18"
			aria-hidden="true"
		>
			<path
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				d="M6 15l6-6 6 6"
			/>
		</svg>
	);
}

type FavoriteItemProps = {
	favorite: Favorite;
	stop: StopGroup;
	tripUpdates: ReadonlyMap<string, TripUpdate>;
	unavailableText?: string | undefined;
	now: number;
	onSelect: () => void;
	onRemove: () => void;
};

/** "[B] Foch-Maison Bleue → Belle-Beille Campus   3 min · 11 min   ×" */
function FavoriteItem({
	favorite,
	stop,
	tripUpdates,
	unavailableText,
	now,
	onSelect,
	onRemove,
}: FavoriteItemProps): JSX.Element {
	const { routeId, directionId } = favorite;
	const route = GTFS_STATIC.routes.get(routeId);
	const lineLabel = route?.shortName ?? routeId;
	const destination =
		getMainDestination(MAIN_DESTINATIONS, routeId, directionId) ??
		"Destination inconnue";
	const departures = getDepartures(
		stop.stopIds,
		tripUpdates,
		GTFS_STATIC,
		now / 1000,
	)
		.filter(
			(departure) =>
				departure.routeId === routeId && departure.directionId === directionId,
		)
		.slice(0, DEPARTURES_PER_FAVORITE);
	const hasTimes = !unavailableText && departures.length > 0;

	return (
		<li className="favorites-panel__item">
			<button
				type="button"
				className="favorites-panel__entry"
				title="Voir l'arrêt sur la carte"
				onClick={onSelect}
			>
				<LineBadge
					label={lineLabel}
					color={route?.color}
					textColor={route?.textColor}
				/>
				<span className="favorites-panel__label">
					<span className="favorites-panel__stop">{stop.name}</span> →{" "}
					{destination}
				</span>
				<span
					className={
						hasTimes
							? "favorites-panel__times"
							: "favorites-panel__times favorites-panel__times--none"
					}
				>
					{hasTimes
						? departures
								.map((departure) => formatDelay(departure.time, now))
								.join(" · ")
						: (unavailableText ?? "Aucun passage dans l'heure")}
				</span>
			</button>
			<button
				type="button"
				className="favorites-panel__icon-button"
				aria-label={`Retirer des favoris : ligne ${lineLabel}, ${stop.name} → ${destination}`}
				title="Retirer des favoris"
				onClick={onRemove}
			>
				×
			</button>
		</li>
	);
}

type FavoritesPanelProps = {
	favorites: Favorite[];
	tripUpdates: ReadonlyMap<string, TripUpdate>;
	tripUpdatesStatus: LoadStatus;
	/** Clic sur un favori : centrer la carte sur son arrêt et ouvrir sa popup */
	onSelect: (stop: StopGroup) => void;
	onRemove: (favorite: Favorite) => void;
};

/**
 * Encadré des favoris et de leurs deux prochains passages. Masqué sans favori, replié en un
 * bouton ★ au chargement sur mobile. Mémoïsé : l'application se redessine chaque seconde.
 */
export const FavoritesPanel = memo(function FavoritesPanel({
	favorites,
	tripUpdates,
	tripUpdatesStatus,
	onSelect,
	onRemove,
}: FavoritesPanelProps): JSX.Element | null {
	const [isExpanded, setIsExpanded] = useState(() => !isMobile());
	const now = useNow(REFRESH_INTERVAL_MS);
	const titleId = useId();

	if (favorites.length === 0) {
		return null;
	}

	if (!isExpanded) {
		return (
			<button
				type="button"
				className="favorites-panel favorites-panel--collapsed"
				aria-label={`Favoris (${favorites.length})`}
				aria-expanded={false}
				onClick={() => withViewTransition(() => setIsExpanded(true))}
			>
				<StarIcon
					filled
					size={18}
				/>
				<span className="favorites-panel__count">{favorites.length}</span>
			</button>
		);
	}

	const unavailableText = getUnavailableText(tripUpdates, tripUpdatesStatus);

	return (
		<section
			className="favorites-panel"
			aria-labelledby={titleId}
		>
			<header className="favorites-panel__header">
				<h2
					id={titleId}
					className="favorites-panel__title"
				>
					<StarIcon filled />
					Favoris
				</h2>
				<button
					type="button"
					className="favorites-panel__icon-button"
					aria-label="Replier les favoris"
					aria-expanded={true}
					onClick={() => withViewTransition(() => setIsExpanded(false))}
				>
					<CollapseIcon />
				</button>
			</header>

			<ul className="favorites-panel__list">
				{favorites.map((favorite) => {
					// Toujours trouvé : sanitizeFavorites écarte les arrêts inconnus
					const stop = STOP_GROUP_BY_STOP_ID.get(favorite.stopId);
					return (
						stop && (
							<FavoriteItem
								key={`${favorite.stopId}/${favorite.routeId}/${favorite.directionId}`}
								favorite={favorite}
								stop={stop}
								tripUpdates={tripUpdates}
								unavailableText={unavailableText}
								now={now}
								onSelect={() => {
									onSelect(stop);
									// Sur mobile, l'encadré déplié cacherait la popup de l'arrêt
									if (isMobile()) {
										withViewTransition(() => setIsExpanded(false));
									}
								}}
								onRemove={() => onRemove(favorite)}
							/>
						)
					);
				})}
			</ul>
		</section>
	);
});
