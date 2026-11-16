import { isTextField } from "@citadel/common/src/browser/dom/isTextField";
import { Skeleton } from "@citadel/design-system/src/atoms/Skeleton";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";
import { FileUp, RefreshCw } from "lucide-react";
import {
	Suspense,
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { QueryErrorBoundary } from "../../../../react/QueryErrorBoundary";
import { backlogErrorReasons } from "../../api/backlogErrorReasons";
import { useMediaRows } from "../../api/media/useMediaRows";
import styles from "../../backlog.module.scss";
import { Button } from "../../components/Button";
import { Toolbar } from "../../components/Toolbar";
import type { BacklogView } from "../../helper/view/backlogView.type";
import { buildViewParams } from "../../helper/view/buildViewParams";
import type { ColumnSetting } from "../../helper/view/columnSetting.type";
import { keepVisibleView } from "../../helper/view/keepVisibleView";
import { loadSavedColumns } from "../../helper/view/loadSavedColumns";
import { mediaTable } from "../../helper/view/mediaTable";
import { moveColumn } from "../../helper/view/moveColumn";
import { readViewFromUrl } from "../../helper/view/readViewFromUrl";
import { saveColumns } from "../../helper/view/saveColumns";
import { setColumnFilter } from "../../helper/view/setColumnFilter";
import { toggleColumnVisibility } from "../../helper/view/toggleColumnVisibility";
import { toggleSort } from "../../helper/view/toggleSort";
import { useEditModeTimeout } from "../Homepage/useEditModeTimeout";
import { MediaModalHost } from "./components/MediaModalHost";
import { MediaTable } from "./components/MediaTable";
import { MEDIA_ROWS_PLACEHOLDER } from "./components/MediaTable/mediaRowsPlaceholder";
import { TmdbAttribution } from "./components/TmdbAttribution";
import { TmdbSearchBar } from "./components/TmdbSearchBar";
import type { MediaModal } from "./mediaModal.type";
import type { MediaTableControls } from "./mediaTableControls.type";
import type { MediaTablePopover } from "./mediaTablePopover.type";
import type { MediaTableSettings } from "./mediaTableSettings.type";

type View = BacklogView<MediaColumnEnum>;

type LoadedMediaTableProps = {
	// La vue lue sur le serveur : celle d'avant reste affichée tant que la nouvelle n'est pas arrivée
	readView: View;
	settings: MediaTableSettings;
	table: MediaTableControls;
};

function LoadedMediaTable({
	readView,
	settings,
	table,
}: LoadedMediaTableProps) {
	const rows = useMediaRows(readView);
	return (
		<MediaTable
			rows={rows.rows}
			matchedCount={rows.matchedCount}
			movieCount={rows.movieCount}
			showCount={rows.showCount}
			originalLanguages={rows.originalLanguages}
			hasNextPage={rows.hasNextPage}
			onLoadNextPage={rows.fetchNextPage}
			isStale={readView !== settings.view}
			settings={settings}
			table={table}
		/>
	);
}

// Le tri et les filtres de l'URL, sans les colonnes masquées dans ce navigateur
function readInitialView(): View {
	return keepVisibleView(
		readViewFromUrl(mediaTable, window.location.search),
		loadSavedColumns(mediaTable) ?? mediaTable.defaultColumns,
	);
}

/**
 * Le backlog des films et séries, en mode classique (§2) : le tableau des jeux, avec ses colonnes, ses saisons et ses
 * épisodes dépliables (une seule série et une seule saison à la fois), la recherche TMDB, l'import de liste et les
 * nouveautés des séries
 */
export function MediaPage() {
	const [modal, setModal] = useState<MediaModal | null>(null);
	const [popover, setPopover] = useState<MediaTablePopover | null>(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [expandedShowId, setExpandedShowId] = useState<number | null>(null);
	const [expandedSeasonId, setExpandedSeasonId] = useState<number | null>(null);
	const [columns, setColumns] = useState<ColumnSetting<MediaColumnEnum>[]>(
		() => loadSavedColumns(mediaTable) ?? [...mediaTable.defaultColumns],
	);
	const [view, setView] = useState<View>(readInitialView);
	const deferredView = useDeferredValue(view);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const isModalOpen = modal !== null;
	const isPopoverOpen = popover !== null;

	// Les fonctions du tableau gardent leur identité : les lignes mémorisées les comparent, et ne se redessinent pas pour rien
	const openModal = useCallback((nextModal: MediaModal | null) => {
		setPopover(null);
		setModal(nextModal);
	}, []);

	// Trier ou filtrer change les lignes affichées : la série dépliée se replie
	const changeView = useCallback((update: (current: View) => View) => {
		setExpandedShowId(null);
		setExpandedSeasonId(null);
		setView(update);
	}, []);
	const changeFilter = useCallback(
		(column: MediaColumnEnum, filter: ColumnFilter<MediaColumnEnum> | null) => {
			changeView((current) => ({
				...current,
				filters: setColumnFilter(current.filters, column, filter),
			}));
		},
		[changeView],
	);
	// Une seule série dépliée : en déplier une autre replie la précédente, et sa saison
	const toggleExpandedShow = useCallback((userMediaId: number) => {
		setExpandedShowId((current) =>
			current === userMediaId ? null : userMediaId,
		);
		setExpandedSeasonId(null);
	}, []);
	const toggleExpandedSeason = useCallback(
		(seasonId: number) =>
			setExpandedSeasonId((current) =>
				current === seasonId ? null : seasonId,
			),
		[],
	);
	const filterOnSaga = useCallback(
		(sagaName: string) =>
			changeFilter(MediaColumnEnum.SAGA, {
				column: MediaColumnEnum.SAGA,
				kind: ColumnFilterKindEnum.TEXT,
				text: sagaName,
				isExact: true,
			}),
		[changeFilter],
	);

	// Une colonne masquée sort du tri et des filtres
	function changeColumnVisibility(key: MediaColumnEnum) {
		const nextColumns = toggleColumnVisibility(mediaTable, columns, key);
		setColumns(nextColumns);
		setView((current) => keepVisibleView(current, nextColumns));
	}

	const leaveEditMode = useCallback(() => setIsEditMode(false), []);
	useEditModeTimeout(isEditMode, isModalOpen, leaveEditMode);

	// La disposition des colonnes se garde dans le navigateur
	useEffect(() => {
		saveColumns(mediaTable, columns);
	}, [columns]);

	// Le tri et les filtres se gardent dans l'URL, sans toucher à l'état du routeur
	useEffect(() => {
		const routerState: unknown = window.history.state;
		const search = new URLSearchParams(buildViewParams(view)).toString();
		window.history.replaceState(
			routerState,
			"",
			`${window.location.pathname}${search === "" ? "" : `?${search}`}${window.location.hash}`,
		);
	}, [view]);

	// Échap ou un clic à côté ferme le menu ouvert du tableau ; une modale gère elle-même Échap
	useEffect(() => {
		if (!isPopoverOpen) return undefined;
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") setPopover(null);
		}
		function closeOnOutsideClick(event: PointerEvent) {
			if (!(
				event.target instanceof Element &&
				event.target.closest("[data-popover]") !== null
			))
				setPopover(null);
		}
		window.addEventListener("keydown", closeOnEscape);
		document.addEventListener("pointerdown", closeOnOutsideClick);
		return () => {
			window.removeEventListener("keydown", closeOnEscape);
			document.removeEventListener("pointerdown", closeOnOutsideClick);
		};
	}, [isPopoverOpen]);

	// « / » met le curseur dans la recherche TMDB, hors d'un champ texte et sans modale ouverte
	useEffect(() => {
		function focusSearch(event: KeyboardEvent) {
			if (
				event.key !== "/" ||
				event.ctrlKey ||
				event.metaKey ||
				event.altKey ||
				isModalOpen ||
				isTextField(event.target)
			)
				return;
			event.preventDefault();
			searchInputRef.current?.focus();
		}
		window.addEventListener("keydown", focusSearch);
		return () => window.removeEventListener("keydown", focusSearch);
	}, [isModalOpen]);

	const table: MediaTableControls = useMemo(
		() => ({
			isEditMode,
			popover,
			setPopover,
			openModal,
			toggleExpandedShow,
			toggleExpandedSeason,
			filterOnSaga,
		}),
		[
			isEditMode,
			popover,
			openModal,
			toggleExpandedShow,
			toggleExpandedSeason,
			filterOnSaga,
		],
	);
	const settings: MediaTableSettings = {
		columns,
		view,
		expandedShowId,
		expandedSeasonId,
		onToggleSort: (column) =>
			changeView((current) => ({
				...current,
				sort: toggleSort(current.sort, column),
			})),
		onFilterChange: changeFilter,
		onFilterModeChange: (filterMode) =>
			changeView((current) => ({ ...current, filterMode })),
		// Sans filtre, la combinaison revient à « et »
		onClearFilters: () =>
			changeView((current) => ({
				...current,
				filters: [],
				filterMode: FilterModeEnum.AND,
			})),
		onFocusSearch: () => searchInputRef.current?.focus(),
		onImportList: () => openModal({ kind: "importList" }),
	};

	return (
		<div className={styles.page}>
			<Toolbar
				search={
					<TmdbSearchBar
						inputRef={searchInputRef}
						onSelect={(hit) =>
							openModal({
								kind: "addMedia",
								mediaType: hit.mediaType,
								tmdbId: hit.tmdbId,
							})
						}
					/>
				}
				actions={
					<>
						<Button
							icon={FileUp}
							tooltip="Ajouter une liste d'identifiants TMDB, depuis un fichier CSV"
							tooltipPlacement="bottom"
							onClick={() => openModal({ kind: "importList" })}
						>
							Importer une liste
						</Button>
						<Button
							icon={RefreshCw}
							tooltip="Relire sur TMDB les séries en cours, et ajouter leurs nouveaux épisodes"
							tooltipPlacement="bottom"
							onClick={() => openModal({ kind: "showUpdates" })}
						>
							Récupérer les nouveautés des séries
						</Button>
					</>
				}
				isEditMode={isEditMode}
				onEditModeChange={setIsEditMode}
				onOpenColumns={() => openModal({ kind: "editColumns" })}
			/>
			<main className={styles.main}>
				<QueryErrorBoundary
					actionLabel="charger les films et séries"
					errorReasons={backlogErrorReasons}
				>
					<Suspense
						fallback={
							<Skeleton label="Chargement des films et séries">
								<MediaTable
									rows={MEDIA_ROWS_PLACEHOLDER}
									matchedCount={MEDIA_ROWS_PLACEHOLDER.length}
									movieCount={MEDIA_ROWS_PLACEHOLDER.length}
									showCount={0}
									originalLanguages={[]}
									hasNextPage={false}
									onLoadNextPage={() => undefined}
									isStale={false}
									settings={settings}
									table={table}
								/>
							</Skeleton>
						}
					>
						<LoadedMediaTable
							readView={deferredView}
							settings={settings}
							table={table}
						/>
					</Suspense>
				</QueryErrorBoundary>
				<TmdbAttribution />
			</main>
			{modal !== null && (
				<MediaModalHost
					modal={modal}
					columns={columns}
					onClose={() => setModal(null)}
					onToggleColumn={changeColumnVisibility}
					onMoveColumn={(key, offset) =>
						setColumns(moveColumn(columns, key, offset))
					}
				/>
			)}
		</div>
	);
}
