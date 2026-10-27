import "leaflet/dist/leaflet.css";
import "./styles/main.scss";

import { useCallback, useMemo, useRef, useState } from "react";

import { AppContainer } from "../../react/AppContainer";
import { ProjectsEnum } from "../../react/appNavigation/projects.enum";
import { ProjectThemeProvider } from "../../react/projectTheme/ProjectThemeProvider";
import { FavoritesPanel } from "./components/FavoritesPanel";
import { InfoPanel } from "./components/InfoPanel";
import { TransitMap } from "./components/TransitMap";
import {
	SIMULATION_TICK_MS,
	TRIP_UPDATES_URL,
	VEHICLE_POSITIONS_URL,
} from "./config";
import { GTFS_STATIC } from "./data/gtfs-static";
import { STOP_GROUP_BY_STOP_ID, STOP_GROUPS } from "./data/stop-groups";
import { FavoritesContext } from "./hooks/useFavorites";
import { useNow } from "./hooks/useNow";
import { usePersistentState } from "./hooks/usePersistentState";
import { useRealtimeFeed } from "./hooks/useRealtimeFeed";
import { useShapes } from "./hooks/useShapes";
import type { Favorite } from "./types/favorite";
import type { StopFocusRequest, StopGroup } from "./types/stop";
import type { VehicleFilter } from "./types/vehicle";
import {
	FAVORITES_STORAGE_KEY,
	sanitizeFavorites,
	toggleFavorite,
} from "./utils/favorites";
import { getTramRoutes } from "./utils/routes";
import {
	LINE_FILTER_STORAGE_KEY,
	sanitizeLineFilter,
	sanitizeSettings,
	sanitizeVehicleFilter,
	SETTINGS_STORAGE_KEY,
	VEHICLE_FILTER_STORAGE_KEY,
} from "./utils/settings";
import { planMotions, simulateVehicles } from "./utils/simulation";
import { filterStopsByRoute, indexRoutesByStopGroup } from "./utils/stops";
import { indexTripUpdates } from "./utils/trip-updates";
import {
	extractVehicles,
	filterVehicles,
	getRouteKind,
	keepRoutesOfKind,
} from "./utils/vehicles";

const TRAM_ROUTES = getTramRoutes(GTFS_STATIC.routes);
/** Liste vide stable : la couche des arrêts, mémoïsée, ne se redessine pas inutilement */
const NO_STOPS: StopGroup[] = [];

export function AngersIrigo() {
	const positions = useRealtimeFeed(VEHICLE_POSITIONS_URL);
	// Heures de passage des popups (véhicules et arrêts) ; sans lui, elles ne s'affichent simplement pas
	const tripUpdatesFeed = useRealtimeFeed(TRIP_UPDATES_URL);
	// Chargés en arrière-plan, sans retarder l'affichage de la carte
	const shapes = useShapes();
	const [filter, setFilter] = usePersistentState(
		VEHICLE_FILTER_STORAGE_KEY,
		sanitizeVehicleFilter,
	);
	const [lineFilter, setLineFilter] = usePersistentState(
		LINE_FILTER_STORAGE_KEY,
		sanitizeLineFilter,
	);
	const [settings, setSettings] = usePersistentState(
		SETTINGS_STORAGE_KEY,
		sanitizeSettings,
	);
	const [favorites, setFavorites] = usePersistentState(
		FAVORITES_STORAGE_KEY,
		sanitizeFavorites,
	);
	const [stopFocus, setStopFocus] = useState<StopFocusRequest>();
	const overlaysRef = useRef<HTMLDivElement>(null);

	const tripUpdates = useMemo(
		() => indexTripUpdates(tripUpdatesFeed.feed),
		[tripUpdatesFeed.feed],
	);
	const vehicles = useMemo(
		() =>
			positions.feed
				? extractVehicles(positions.feed, GTFS_STATIC, tripUpdates, shapes)
				: [],
		[positions.feed, tripUpdates, shapes],
	);

	// Trajets prévus, recalculés à chaque nouvelle donnée : la simulation en tire les positions
	// estimées chaque seconde, les repères de temps du tracé sélectionné s'en servent même sans elle
	const motions = useMemo(
		() =>
			shapes
				? planMotions(vehicles, tripUpdates, shapes, GTFS_STATIC)
				: undefined,
		[vehicles, tripUpdates, shapes],
	);
	const isSimulating = motions !== undefined && settings.simulateMovement;
	const now = useNow(isSimulating ? SIMULATION_TICK_MS : null);
	const currentVehicles =
		motions && isSimulating
			? simulateVehicles(vehicles, motions, now / 1000)
			: vehicles;

	// Les paramètres décident de ce qui est affichable ; les filtres (mode, lignes) s'appliquent ensuite
	const displayableVehicles = settings.showStaleVehicles
		? currentVehicles
		: currentVehicles.filter((vehicle) => !vehicle.isStale);

	// Arrêts des lignes affichables (mode, lignes choisies), une fois les tracés chargés : ce sont
	// eux qui disent quelles lignes desservent chaque arrêt. Liste stable, la couche des arrêts est mémoïsée.
	const routeIdsByStopGroup = useMemo(
		() =>
			shapes &&
			indexRoutesByStopGroup(shapes, GTFS_STATIC, STOP_GROUP_BY_STOP_ID),
		[shapes],
	);
	const stops = useMemo(() => {
		if (!settings.showStops) {
			return NO_STOPS;
		}
		if (!routeIdsByStopGroup || (filter === "all" && lineFilter.length === 0)) {
			return STOP_GROUPS;
		}
		return filterStopsByRoute(
			STOP_GROUPS,
			routeIdsByStopGroup,
			(routeId) =>
				(filter === "all" ||
					getRouteKind(routeId, GTFS_STATIC.routes) === filter) &&
				(lineFilter.length === 0 || lineFilter.includes(routeId)),
		);
	}, [settings.showStops, routeIdsByStopGroup, filter, lineFilter]);

	// Stables entre deux changements de favoris : l'encadré et les popups ne se redessinent pas chaque seconde
	const handleFavoriteToggle = useCallback(
		(favorite: Favorite) => setFavorites(toggleFavorite(favorites, favorite)),
		[favorites, setFavorites],
	);
	const favoritesContext = useMemo(
		() => ({ favorites, onToggle: handleFavoriteToggle }),
		[favorites, handleFavoriteToggle],
	);
	// Passer à « Trams » ne garde que les lignes de tram choisies, à « Bus » que celles de bus
	function handleFilterChange(newFilter: VehicleFilter): void {
		setFilter(newFilter);
		setLineFilter(keepRoutesOfKind(lineFilter, newFilter, GTFS_STATIC.routes));
	}
	const focusStop = useCallback(
		(stop: StopGroup) => setStopFocus({ stop }),
		[],
	);
	const endStopFocus = useCallback(() => setStopFocus(undefined), []);

	return (
		<AppContainer>
			<ProjectThemeProvider project={ProjectsEnum.AngersIrigo}>
				<FavoritesContext value={favoritesContext}>
					<div className="angers-irigo">
						<TransitMap
							vehicles={filterVehicles(displayableVehicles, filter, lineFilter)}
							stops={stops}
							routeIdsByStopGroup={routeIdsByStopGroup}
							motions={motions}
							simulationSeconds={isSimulating ? now / 1000 : undefined}
							timeMarkersMinutes={settings.timeMarkersMinutes}
							tripUpdates={tripUpdates}
							stopFocus={stopFocus}
							onStopFocusEnd={endStopFocus}
							overlaysRef={overlaysRef}
						/>
						{/* Panneaux par-dessus la carte : à gauche et à droite sur ordinateur, l'un sous l'autre sur mobile */}
						<div
							ref={overlaysRef}
							className="map-overlays"
						>
							<InfoPanel
								vehicles={displayableVehicles}
								tramRoutes={TRAM_ROUTES}
								status={positions.status}
								updatedAt={positions.updatedAt}
								filter={filter}
								onFilterChange={handleFilterChange}
								lineFilter={lineFilter}
								onLineFilterChange={setLineFilter}
								settings={settings}
								onSettingsChange={setSettings}
								onStopSelect={focusStop}
							/>
							<FavoritesPanel
								favorites={favorites}
								tripUpdates={tripUpdates}
								tripUpdatesStatus={tripUpdatesFeed.status}
								onSelect={focusStop}
								// Le favori est forcément dans la liste : le basculer le retire
								onRemove={handleFavoriteToggle}
							/>
						</div>
					</div>
				</FavoritesContext>
			</ProjectThemeProvider>
		</AppContainer>
	);
}
