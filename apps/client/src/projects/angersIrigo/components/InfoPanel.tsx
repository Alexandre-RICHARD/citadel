/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./InfoPanel.scss";

import { Castle } from "lucide-react";
import { type JSX, useId, useState } from "react";
import { Link } from "react-router";

import { buildReturnToHomepagePath } from "../../../react/appNavigation/buildReturnToHomepagePath";
import { ProjectsEnum } from "../../../react/appNavigation/projects.enum";
import { STALE_POSITION_SECONDS } from "../config";
import { usePersistentState } from "../hooks/usePersistentState";
import type { GtfsRoute } from "../types/gtfs-static";
import type { LoadStatus } from "../types/load-status";
import type { Settings } from "../types/settings";
import type { StopGroup } from "../types/stop";
import type { Vehicle, VehicleFilter } from "../types/vehicle";
import {
	INFO_PANEL_COLLAPSED_STORAGE_KEY,
	sanitizeCollapsed,
} from "../utils/settings";
import { countVehicles, filterVehicles } from "../utils/vehicles";
import { withViewTransition } from "../utils/viewTransition";
import { FeedStatusLine } from "./FeedStatusLine";
import { LineBadge } from "./LineBadge";
import { LineFilterControl } from "./LineFilterControl";
import { SettingsPanel } from "./SettingsPanel";
import { StopSearch } from "./StopSearch";
import { VehicleFilterControl } from "./VehicleFilterControl";

const STALE_POSITION_MINUTES = STALE_POSITION_SECONDS / 60;

type InfoPanelProps = {
	/** Véhicules affichables, avant le filtre Tous / Trams / Bus (pour les compteurs) */
	vehicles: Vehicle[];
	/** Lignes de tram, pour la légende */
	tramRoutes: GtfsRoute[];
	status: LoadStatus;
	updatedAt?: Date | undefined;
	filter: VehicleFilter;
	onFilterChange: (filter: VehicleFilter) => void;
	/** Lignes affichées ; aucune = toutes */
	lineFilter: string[];
	onLineFilterChange: (routeIds: string[]) => void;
	settings: Settings;
	onSettingsChange: (settings: Settings) => void;
	/** Arrêt choisi dans la recherche */
	onStopSelect: (stop: StopGroup) => void;
};

function SettingsIcon(): JSX.Element {
	return (
		<svg
			viewBox="0 0 24 24"
			width="20"
			height="20"
			aria-hidden="true"
		>
			<path
				fill="currentColor"
				d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.74 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.63-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
			/>
		</svg>
	);
}

/** Chevron vers le haut (replier) ; retourné par le CSS quand le panneau est replié */
function ChevronIcon(): JSX.Element {
	return (
		<svg
			viewBox="0 0 24 24"
			width="20"
			height="20"
			aria-hidden="true"
		>
			<path
				fill="currentColor"
				d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"
			/>
		</svg>
	);
}

export function InfoPanel({
	vehicles,
	tramRoutes,
	status,
	updatedAt,
	filter,
	onFilterChange,
	lineFilter,
	onLineFilterChange,
	settings,
	onSettingsChange,
	onStopSelect,
}: InfoPanelProps): JSX.Element {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const settingsPanelId = useId();
	// Replié, le panneau laisse toute la carte visible (surtout sur téléphone) ; gardé d'une visite à l'autre
	const [isCollapsed, setIsCollapsed] = usePersistentState(
		INFO_PANEL_COLLAPSED_STORAGE_KEY,
		sanitizeCollapsed,
	);

	// Replié ou déplié, l'en-tête reste le même : le titre ne bouge pas
	return (
		<aside
			className={
				isCollapsed ? "info-panel info-panel--collapsed" : "info-panel"
			}
		>
			<header className="info-panel__header">
				<div>
					<h1 className="info-panel__title">Irigo en direct</h1>
					{!isCollapsed && (
						<p className="info-panel__subtitle">Bus et trams d&apos;Angers</p>
					)}
				</div>
				<div className="info-panel__header-buttons">
					{!isCollapsed && (
						<Link
							to={buildReturnToHomepagePath(ProjectsEnum.AngersIrigo)}
							className="info-panel__icon-button info-panel__return-link"
							aria-label="Retour à la Citadel"
							title="Retour à la Citadel"
						>
							<Castle
								size={20}
								aria-hidden
							/>
						</Link>
					)}
					{!isCollapsed && (
						<button
							type="button"
							className="info-panel__icon-button info-panel__settings-button"
							aria-label="Paramètres"
							aria-expanded={isSettingsOpen}
							aria-controls={settingsPanelId}
							onClick={() => setIsSettingsOpen(!isSettingsOpen)}
						>
							<SettingsIcon />
						</button>
					)}
					<button
						type="button"
						className="info-panel__icon-button info-panel__collapse-button"
						aria-label={
							isCollapsed ? "Déplier le panneau" : "Replier le panneau"
						}
						aria-expanded={!isCollapsed}
						onClick={() =>
							withViewTransition(() => setIsCollapsed(!isCollapsed))
						}
					>
						<ChevronIcon />
					</button>
				</div>
			</header>

			{!isCollapsed && (
				<>
					<StopSearch onSelect={onStopSelect} />

					<FeedStatusLine
						status={status}
						updatedAt={updatedAt}
					/>

					<VehicleFilterControl
						value={filter}
						counts={countVehicles(vehicles)}
						onChange={onFilterChange}
					/>
					<LineFilterControl
						vehicles={filterVehicles(vehicles, filter)}
						selectedRouteIds={lineFilter}
						onChange={onLineFilterChange}
					/>

					<ul
						className="info-panel__legend"
						aria-label="Légende"
					>
						{tramRoutes.map((route) => (
							<li key={route.routeId}>
								<LineBadge
									label={route.shortName}
									color={route.color}
									textColor={route.textColor}
								/>
								<span className="info-panel__legend-label">
									{route.longName}
								</span>
							</li>
						))}
						<li>
							<span
								className="info-panel__bus-dot"
								aria-hidden="true"
							/>
							<span className="info-panel__legend-label">
								Bus (numéro de ligne)
							</span>
						</li>
						{settings.showStaleVehicles && (
							<li>
								<span
									className="info-panel__bus-dot info-panel__bus-dot--stale"
									aria-hidden="true"
								/>
								<span className="info-panel__legend-label">
									Immobile depuis {STALE_POSITION_MINUTES} min
								</span>
							</li>
						)}
					</ul>

					{isSettingsOpen && (
						<SettingsPanel
							id={settingsPanelId}
							settings={settings}
							onChange={onSettingsChange}
						/>
					)}
				</>
			)}
		</aside>
	);
}
