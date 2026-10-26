import { Skeleton } from "@citadel/design-system/src/atoms/Skeleton";
import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type";
import {
	Suspense,
	useCallback,
	useDeferredValue,
	useEffect,
	useRef,
	useState,
} from "react";

import { QueryErrorBoundary } from "../../../../react/QueryErrorBoundary";
import { backlogErrorReasons } from "../../api/backlogErrorReasons";
import type { BacklogOverviewFm } from "../../api/model/backlogOverviewFm.type";
import { useBacklogOverview } from "../../api/overview/useBacklogOverview";
import { useBacklogRows } from "../../api/userGame/useBacklogRows";
import styles from "../../backlog.module.scss";
import { isTextField } from "../../helper/dom/isTextField";
import { toggleId } from "../../helper/list/toggleId";
import type { BacklogView } from "../../helper/view/backlogView.type";
import { buildViewParams } from "../../helper/view/buildViewParams";
import type { ColumnSetting } from "../../helper/view/columnSetting.type";
import { DEFAULT_COLUMNS } from "../../helper/view/defaultColumns";
import { keepVisibleView } from "../../helper/view/keepVisibleView";
import { loadSavedColumns } from "../../helper/view/loadSavedColumns";
import { moveColumn } from "../../helper/view/moveColumn";
import { readViewFromUrl } from "../../helper/view/readViewFromUrl";
import { saveColumns } from "../../helper/view/saveColumns";
import { setColumnFilter } from "../../helper/view/setColumnFilter";
import { toggleColumnVisibility } from "../../helper/view/toggleColumnVisibility";
import { toggleSort } from "../../helper/view/toggleSort";
import type { BacklogModal } from "./backlogModal.type";
import { BacklogTable } from "./components/BacklogTable";
import { BACKLOG_ROWS_PLACEHOLDER } from "./components/BacklogTable/backlogRowsPlaceholder";
import { ModalHost } from "./components/ModalHost";
import { Toolbar } from "./components/Toolbar";
import { getHitModal } from "./getHitModal";
import { getNextQueuedModal } from "./getNextQueuedModal";
import type { TableControls } from "./tableControls.type";
import type { TablePopover } from "./tablePopover.type";
import type { TableSettings } from "./tableSettings.type";
import { useEditModeTimeout } from "./useEditModeTimeout";

type LoadedBacklogTableProps = {
	// La vue lue sur le serveur : celle d'avant reste affichée tant que la nouvelle n'est pas arrivée
	readView: BacklogView;
	settings: TableSettings;
	table: TableControls;
};

function LoadedBacklogTable({
	readView,
	settings,
	table,
}: LoadedBacklogTableProps) {
	const { rows, matchedCount, hasNextPage, fetchNextPage } =
		useBacklogRows(readView);
	return (
		<BacklogTable
			rows={rows}
			matchedCount={matchedCount}
			hasNextPage={hasNextPage}
			onLoadNextPage={fetchNextPage}
			isStale={readView !== settings.view}
			settings={settings}
			table={table}
		/>
	);
}

// Le tri et les filtres de l'URL, sans les colonnes masquées dans ce navigateur (cahier des charges, §4 et §9)
function readInitialView(): BacklogView {
	return keepVisibleView(
		readViewFromUrl(window.location.search),
		loadSavedColumns() ?? DEFAULT_COLUMNS,
	);
}

export function Homepage() {
	const [modal, setModal] = useState<BacklogModal | null>(null);
	const [popover, setPopover] = useState<TablePopover | null>(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [expandedGameIds, setExpandedGameIds] = useState<number[]>([]);
	const [columns, setColumns] = useState<ColumnSetting[]>(
		() => loadSavedColumns() ?? [...DEFAULT_COLUMNS],
	);
	const [view, setView] = useState<BacklogView>(readInitialView);
	const deferredView = useDeferredValue(view);
	const overview: BacklogOverviewFm | null = useBacklogOverview();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const isModalOpen = modal !== null;
	const isPopoverOpen = popover !== null;

	function openModal(nextModal: BacklogModal | null) {
		setPopover(null);
		setModal(nextModal);
	}

	// Fermer une modale de l'enchaînement, même par « Annuler », ouvre le DLC suivant de la file
	function closeModal() {
		setModal((current) =>
			getNextQueuedModal(
				current !== null && "queuedIgdbIds" in current
					? current.queuedIgdbIds
					: [],
			),
		);
	}

	function changeFilter(
		column: BacklogColumnEnum,
		filter: ColumnFilter | null,
	) {
		setView((current) => ({
			...current,
			filters: setColumnFilter(current.filters, column, filter),
		}));
	}

	// Une colonne masquée sort du tri et des filtres (cahier des charges, §9)
	function changeColumnVisibility(key: BacklogColumnEnum) {
		const nextColumns = toggleColumnVisibility(columns, key);
		setColumns(nextColumns);
		setView((current) => keepVisibleView(current, nextColumns));
	}

	const leaveEditMode = useCallback(() => setIsEditMode(false), []);
	useEditModeTimeout(isEditMode, isModalOpen, leaveEditMode);

	// La disposition des colonnes se garde dans le navigateur (cahier des charges, §9)
	useEffect(() => {
		saveColumns(columns);
	}, [columns]);

	// Le tri et les filtres se gardent dans l'URL (cahier des charges, §9), sans toucher à l'état du routeur
	useEffect(() => {
		const routerState: unknown = window.history.state;
		const search = new URLSearchParams(buildViewParams(view)).toString();
		window.history.replaceState(
			routerState,
			"",
			`${window.location.pathname}${search === "" ? "" : `?${search}`}${window.location.hash}`,
		);
	}, [view]);

	// Échap ou un clic à côté ferme le panneau ouvert du tableau ; une modale gère elle-même Échap
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

	// « / » met le curseur dans la recherche IGDB, hors d'un champ texte et sans modale ouverte
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

	const table: TableControls = {
		isEditMode,
		popover,
		setPopover,
		openModal,
		toggleExpanded: (gameId) =>
			setExpandedGameIds((current) => toggleId(current, gameId)),
		filterOnSeries: (seriesName) =>
			changeFilter(BacklogColumnEnum.SERIES, {
				column: BacklogColumnEnum.SERIES,
				kind: ColumnFilterKindEnum.TEXT,
				text: seriesName,
				isExact: true,
			}),
	};
	const settings: TableSettings = {
		columns,
		view,
		overview,
		expandedGameIds,
		onToggleSort: (column) =>
			setView((current) => ({
				...current,
				sort: toggleSort(current.sort, column),
			})),
		onFilterChange: changeFilter,
		onClearFilters: () => setView((current) => ({ ...current, filters: [] })),
		onFocusSearch: () => searchInputRef.current?.focus(),
	};

	return (
		<div className={styles.page}>
			<Toolbar
				searchInputRef={searchInputRef}
				outsideBacklogGameCount={overview?.outsideBacklogGameCount ?? null}
				isEditMode={isEditMode}
				onEditModeChange={setIsEditMode}
				onSelectHit={(hit) => openModal(getHitModal(hit))}
				onOpenModal={openModal}
			/>
			<main className={styles.main}>
				<QueryErrorBoundary
					actionLabel="charger le backlog"
					errorReasons={backlogErrorReasons}
				>
					<Suspense
						fallback={
							<Skeleton label="Chargement du backlog">
								<BacklogTable
									rows={BACKLOG_ROWS_PLACEHOLDER}
									matchedCount={BACKLOG_ROWS_PLACEHOLDER.length}
									hasNextPage={false}
									onLoadNextPage={() => undefined}
									isStale={false}
									settings={settings}
									table={table}
								/>
							</Skeleton>
						}
					>
						<LoadedBacklogTable
							readView={deferredView}
							settings={settings}
							table={table}
						/>
					</Suspense>
				</QueryErrorBoundary>
			</main>
			{modal !== null && (
				<ModalHost
					modal={modal}
					columns={columns}
					onOpenModal={openModal}
					onClose={closeModal}
					onToggleColumn={changeColumnVisibility}
					onMoveColumn={(key, offset) =>
						setColumns(moveColumn(columns, key, offset))
					}
				/>
			)}
		</div>
	);
}
