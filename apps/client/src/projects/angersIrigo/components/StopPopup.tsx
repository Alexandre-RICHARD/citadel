/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./StopPopup.scss";

import type { JSX } from "react";

import { MAX_FAVORITES } from "../config";
import { GTFS_STATIC } from "../data/gtfs-static";
import { MAIN_DESTINATIONS } from "../data/main-destinations";
import { useFavorites } from "../hooks/useFavorites";
import { useNow } from "../hooks/useNow";
import type { Favorite } from "../types/favorite";
import type { TripUpdate } from "../types/gtfs-realtime";
import type { Departure, DirectionDepartures, StopGroup } from "../types/stop";
import { isSameFavorite } from "../utils/favorites";
import { formatClock, formatDelay } from "../utils/format";
import { getDepartures, groupDeparturesByLine } from "../utils/stops";
import { LineBadge } from "./LineBadge";
import { StarIcon } from "./StarIcon";

const DEPARTURES_PER_DIRECTION = 4;
/** Les délais sont en minutes : les recalculer toutes les 30 s suffit */
const REFRESH_INTERVAL_MS = 30_000;

/** Précision affichée à côté d'un passage qui ne suit pas le trajet habituel du sens */
function getDepartureNote(
	departure: Departure,
	direction: DirectionDepartures,
): string | undefined {
	if (departure.isArrival) {
		return "Terminus";
	}
	// Course partielle, ex : tram A s'arrêtant à Verneau au lieu d'Avrillé-Ardenne
	if (
		departure.destination &&
		departure.destination !== direction.mainDestination
	) {
		return `→ ${departure.destination}`;
	}
	return undefined;
}

type FavoriteToggleProps = {
	favorite: Favorite;
	/** "B Monplaisir → Belle-Beille Campus", pour les lecteurs d'écran */
	label: string;
};

/** Étoile d'une colonne : ajoute ce sens de la ligne à cet arrêt aux favoris, ou l'en retire */
function FavoriteToggle({ favorite, label }: FavoriteToggleProps): JSX.Element {
	const { favorites, onToggle } = useFavorites();
	const isActive = favorites.some((item) => isSameFavorite(item, favorite));
	const isDisabled = !isActive && favorites.length >= MAX_FAVORITES;
	const title = isDisabled
		? `${MAX_FAVORITES} favoris maximum`
		: isActive
			? "Retirer des favoris"
			: "Ajouter aux favoris";

	return (
		// aria-disabled plutôt que disabled : l'infobulle « 5 favoris maximum » s'affiche quand même au survol
		<button
			type="button"
			className="stop-popup__favorite"
			aria-label={`Favori : ligne ${label}`}
			aria-pressed={isActive}
			aria-disabled={isDisabled}
			title={title}
			onClick={() => {
				if (!isDisabled) {
					onToggle(favorite);
				}
			}}
		>
			<StarIcon filled={isActive} />
		</button>
	);
}

type StopPopupProps = {
	stop: StopGroup;
	tripUpdates: ReadonlyMap<string, TripUpdate>;
};

/** Prochains passages à un arrêt dans l'heure à venir : un bloc par ligne, une colonne par sens */
export function StopPopup({ stop, tripUpdates }: StopPopupProps): JSX.Element {
	// Le composant n'existe que tant que la popup est ouverte : le calcul ne concerne qu'un arrêt
	const now = useNow(REFRESH_INTERVAL_MS);
	const { favorites } = useFavorites();
	const departures = getDepartures(
		stop.stopIds,
		tripUpdates,
		GTFS_STATIC,
		now / 1000,
	);
	const lines = groupDeparturesByLine(
		departures,
		MAIN_DESTINATIONS,
		DEPARTURES_PER_DIRECTION,
	);

	// Un sens n'a pas d'étoile si le flux ne le précise pas (course inconnue du GTFS théorique)
	const columnFavorites = lines.flatMap((line) =>
		line.directions.flatMap(({ directionId }) =>
			directionId === undefined
				? []
				: [{ stopId: stop.id, routeId: line.routeId, directionId }],
		),
	);
	const hasDisabledFavorites =
		favorites.length >= MAX_FAVORITES &&
		columnFavorites.some(
			(favorite) => !favorites.some((item) => isSameFavorite(item, favorite)),
		);

	return (
		<div className="stop-popup">
			<h3 className="stop-popup__name">{stop.name}</h3>

			{lines.length === 0 ? (
				<p className="stop-popup__empty">
					Aucun passage prévu dans l&apos;heure
				</p>
			) : (
				<div className="stop-popup__lines">
					{lines.map((line) => {
						const lineLabel = line.route?.shortName ?? line.routeId;
						return (
							<section
								key={line.routeId}
								className="stop-popup__line"
								aria-label={`Ligne ${lineLabel}`}
							>
								<LineBadge
									label={lineLabel}
									color={line.route?.color}
									textColor={line.route?.textColor}
								/>
								<div className="stop-popup__directions">
									{line.directions.map((direction) => (
										<div
											key={direction.directionId ?? "inconnu"}
											className="stop-popup__direction"
										>
											<div className="stop-popup__direction-header">
												<h4 className="stop-popup__direction-label">
													{direction.label}
												</h4>
												{direction.directionId !== undefined && (
													<FavoriteToggle
														favorite={{
															stopId: stop.id,
															routeId: line.routeId,
															directionId: direction.directionId,
														}}
														label={`${lineLabel} ${direction.label}`}
													/>
												)}
											</div>
											<ol className="stop-popup__departures">
												{direction.departures.map((departure) => {
													const note = getDepartureNote(departure, direction);
													return (
														<li
															key={departure.tripId}
															className="stop-popup__departure"
														>
															<span className="stop-popup__delay">
																{formatDelay(departure.time, now)}
															</span>
															<span className="stop-popup__clock">
																{formatClock(departure.time)}
															</span>
															{note && (
																<span className="stop-popup__note">{note}</span>
															)}
														</li>
													);
												})}
											</ol>
										</div>
									))}
								</div>
							</section>
						);
					})}
				</div>
			)}

			<p className="stop-popup__footnote">
				Temps réel · passages de l&apos;heure à venir
			</p>
			{hasDisabledFavorites && (
				<p className="stop-popup__footnote">
					{MAX_FAVORITES} favoris maximum : retirez-en un pour en ajouter un
					autre
				</p>
			)}
		</div>
	);
}
