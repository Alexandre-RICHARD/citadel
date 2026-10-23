import {
	ArrowDown,
	ArrowUp,
	BadgeCheck,
	Ban,
	Blocks,
	Bookmark,
	BookOpen,
	Bug,
	CalendarClock,
	CalendarDays,
	Check,
	ChevronDown,
	ChevronRight,
	ChevronUp,
	CircleAlert,
	CircleCheck,
	CircleDashed,
	ClipboardCheck,
	ClipboardX,
	Columns3,
	Copy,
	CopyPlus,
	CornerDownRight,
	Cpu,
	Crown,
	Database as DatabaseIcon,
	EllipsisVertical,
	ExternalLink,
	Eye,
	Flag,
	FunnelX,
	Gamepad2,
	Gauge,
	Globe,
	GripVertical,
	ImageIcon,
	ImageOff,
	Info,
	Layers,
	LibraryBig,
	ListFilter,
	ListOrdered,
	Lock,
	type LucideIcon,
	LucideProvider,
	Minus,
	PackageCheck,
	Palette,
	Pencil,
	PencilLine,
	Play,
	Plus,
	Puzzle,
	Redo2,
	Repeat,
	Search,
	SearchX,
	SquarePen,
	Terminal,
	Timer,
	Trash2,
	TriangleAlert,
	Trophy,
	Undo2,
	Users,
	X,
} from "lucide-react";
import {
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";

import styles from "./backlog.module.scss";
import { Button } from "./components/Button";
import { Callout } from "./components/Callout";
import { Checkbox } from "./components/Checkbox";
import { DateField } from "./components/DateField";
import { DurationField } from "./components/DurationField";
import { Menu } from "./components/Menu";
import type { MenuItem } from "./components/Menu/menuItem.type";
import { Modal as ModalDialog } from "./components/Modal";
import { NumberField } from "./components/NumberField";
import { Popover as FloatingPanel } from "./components/Popover";
import { SegmentedControl } from "./components/SegmentedControl";
import { Select } from "./components/Select";
import type { SelectOption } from "./components/Select/selectOption.type";
import { Spinner } from "./components/Spinner";
import { TextField } from "./components/TextField";
import { Tooltip } from "./components/Tooltip";
import { initialState } from "./initialState";
import {
	mapDatabaseSearchResult,
	mapEditGameImport,
	mapGameImages,
	mapGameImport,
	mapGameRows,
	mapSearchResult,
} from "./mappers";
import {
	type AppState,
	type ColumnFilter,
	type ColumnKey,
	type ColumnSetting,
	type Company,
	type Database,
	type Dlc,
	type EndingType,
	endingTypeDefinitions,
	type GameImport,
	type GameRow,
	type IgdbImageId,
	type ImportSelection,
	type IsoDate,
	type Modal,
	type Platform,
	type Popover,
	type SearchResult,
	type Series,
	type SeriesChoice,
	type SeriesEntry,
	type SortCriterion,
	type Status,
	statusDefinitions,
	type TableHandlers,
	type UserGameDraft,
	type UserVersion,
	type UserVersionDraft,
	type UserVersionRow,
	type Version,
	type VersionPlatform,
} from "./types";
import {
	addDlcs,
	addGameImport,
	addUserVersion,
	backlogPageSize,
	blurOnEnter,
	buildInitialStateFile,
	buildViewSearch,
	columnFilterKinds,
	convertStatus,
	databasePageSize,
	describeFilters,
	dropSeriesEntry,
	editModeIdleMs,
	emptyImportSelection,
	fetchIgdbGameData,
	fetchIgdbGameImages,
	filterGameRows,
	findById,
	findSeriesNumberOwner,
	findUserGame,
	formatDlcProgress,
	formatDuration,
	formatFinishCount,
	formatIsoDate,
	formatReleaseDate,
	formatSeriesNumber,
	formatSeriesValue,
	getAddUserVersionModal,
	getColumnLabel,
	getDefaultSeriesNumber,
	getDlcAsGameQueue,
	getDraftSeriesEntries,
	getEndingTypeLabel,
	getFilterOptions,
	getGameModal,
	getGameUserVersionIds,
	getIgdbImageUrl,
	getLastAddedGame,
	getNextQueuedModal,
	getNextUserVersionId,
	getPlatformOptions,
	getQueuedGameIds,
	getReorderSeriesModal,
	getRowData,
	getSeriesDrop,
	getSeriesOrderConflicts,
	getStatusLabel,
	getTodayIsoDate,
	getUserGameDraft,
	getVersionLabel,
	hasGameEditChanges,
	hasSeriesOrderChanges,
	hasUserGameChanges,
	isDurationColumn,
	isFinishedStatus,
	isSeriesChoiceValid,
	isSeriesSubNumber,
	isSortableColumn,
	isStatusAllowed,
	joinClassNames,
	keepSelection,
	keepVisibleColumns,
	loadSavedColumns,
	moveColumn,
	parseSeriesNumber,
	parseSeriesValue,
	placeSeriesEntry,
	pushToHistory,
	readViewFromUrl,
	receiveEditGameImport,
	receiveGameDlcs,
	receiveGameImages,
	receiveGameImport,
	removeUserVersions,
	saveColumns,
	saveSeriesNumbers,
	saveUserGame,
	searchDatabaseGames,
	searchDelayMs,
	searchIgdbGames,
	setColumnFilter,
	setUserVersionStatus,
	sortGameRows,
	toggleColumnVisibility,
	toggleDoneDlc,
	toggleId,
	toggleSort,
	updateUserVersion,
} from "./utils";

// ---------- Petits composants ----------

/** Icônes embarquées dans `icons/`, nommées par le nom technique de leur plateforme (ex. `ps2.svg`) */
const platformIconUrls = import.meta.glob<string>("./icons/*.svg", {
	eager: true,
	query: "?url",
	import: "default",
});

const thumbnailSizes = {
	sm: styles.thumbnailSm,
	md: styles.thumbnailMd,
	lg: styles.thumbnailLg,
};

/** Miniature IGDB : `t_thumb`, et `t_thumb_2x` pour les écrans haute densité ; sans image, une icône */
function Thumbnail({
	imageId,
	size = "md",
}: {
	imageId: IgdbImageId | null;
	size?: keyof typeof thumbnailSizes;
}) {
	const className = joinClassNames(styles.thumbnail, thumbnailSizes[size]);
	if (imageId === null) {
		return (
			<span className={joinClassNames(className, styles.thumbnailPlaceholder)}>
				<ImageOff aria-hidden />
			</span>
		);
	}
	return (
		<img
			className={className}
			src={getIgdbImageUrl(imageId, "thumb")}
			srcSet={`${getIgdbImageUrl(imageId, "thumb", true)} 2x`}
			alt=""
			loading="lazy"
		/>
	);
}

/** Jaquette de la prévisualisation : `t_cover_small`, en portrait */
function Cover({ imageId }: { imageId: IgdbImageId | null }) {
	if (imageId === null) {
		return (
			<span className={joinClassNames(styles.cover, styles.coverPlaceholder)}>
				<ImageOff aria-hidden />
			</span>
		);
	}
	return (
		<img
			className={styles.cover}
			src={getIgdbImageUrl(imageId, "cover_small")}
			srcSet={`${getIgdbImageUrl(imageId, "cover_small", true)} 2x`}
			alt=""
		/>
	);
}

/** Société : logo au-dessus du nom, posé sur une plaque claire en thème sombre */
function CompanyLabel({ company }: { company: Company | null }) {
	if (company === null) {
		return <span className={styles.emptyValue}>—</span>;
	}
	return (
		<span className={styles.company}>
			{company.logoImageId !== null && (
				<span className={styles.companyLogo}>
					<img
						src={getIgdbImageUrl(company.logoImageId, "logo_med")}
						alt=""
						loading="lazy"
					/>
				</span>
			)}
			<span className={styles.companyName}>{company.name}</span>
		</span>
	);
}

/** Plateforme : icône et nom, le nom seul si l'icône manque ; un émulateur est signalé */
function PlatformLabel({ platform }: { platform: Platform }) {
	const iconUrl: string | undefined =
		platformIconUrls[`./icons/${platform.technicalName}.svg`];
	const isEmulator = platform.emulatedPlatformId !== null;
	return (
		<Tooltip content={isEmulator ? "Émulateur" : null}>
			<span
				className={joinClassNames(
					styles.platform,
					isEmulator && styles.emulator,
				)}
			>
				{iconUrl === undefined ? (
					isEmulator && <Cpu aria-hidden />
				) : (
					<img
						src={iconUrl}
						alt=""
					/>
				)}
				{platform.shortName}
			</span>
		</Tooltip>
	);
}

/** Icône et teinte de chaque statut : du gris (pas commencé) à l'or (complété et platiné), rouge pour abandonné */
const statusAppearances: Record<Status, { icon: LucideIcon; tone: string }> = {
	notStarted: { icon: CircleDashed, tone: styles.toneGray },
	watched: { icon: Eye, tone: styles.toneViolet },
	started: { icon: Play, tone: styles.toneBlue },
	wellUnderway: { icon: Gauge, tone: styles.toneCyan },
	finished: { icon: Flag, tone: styles.toneGreen },
	deemedFinished: { icon: CircleCheck, tone: styles.toneGreen },
	completed: { icon: BadgeCheck, tone: styles.toneTeal },
	platinum: { icon: Trophy, tone: styles.toneIndigo },
	completedAndPlatinum: { icon: Crown, tone: styles.toneAmber },
	abandoned: { icon: Ban, tone: styles.toneRed },
};

function StatusBadge({ status }: { status: Status }) {
	const { icon: Icon, tone } = statusAppearances[status];
	return (
		<span className={joinClassNames(styles.badge, tone)}>
			<Icon aria-hidden />
			{getStatusLabel(status)}
		</span>
	);
}

const endingTypeIcons: Record<EndingType, LucideIcon> = {
	story: BookOpen,
	runs: Repeat,
	sandbox: Blocks,
	multiplayer: Users,
};

function EndingTypeLabel({ endingType }: { endingType: EndingType }) {
	const Icon = endingTypeIcons[endingType];
	return (
		<span className={styles.endingType}>
			<Icon aria-hidden />
			{getEndingTypeLabel(endingType)}
		</span>
	);
}

/** Libellé de `formatReleaseDate` sans date : « à venir » */
const upcomingReleaseLabel = formatReleaseDate(null, false);

/** Date de sortie (section 7) : la date, ou une pastille « à venir » ou « annulé » */
function ReleaseDateLabel({
	date,
	isCancelled,
}: {
	date: IsoDate | null;
	isCancelled: boolean;
}) {
	const label = formatReleaseDate(date, isCancelled);
	if (isCancelled) {
		return (
			<span className={joinClassNames(styles.badge, styles.toneRed)}>
				<Ban aria-hidden />
				{label}
			</span>
		);
	}
	if (label === upcomingReleaseLabel) {
		return (
			<span className={joinClassNames(styles.badge, styles.toneViolet)}>
				<CalendarClock aria-hidden />
				{label}
			</span>
		);
	}
	return <span className={styles.number}>{label}</span>;
}

/** Note sur 20, teintée : vert à partir de 16, sarcelle à 12, ambre à 8, rouge en dessous */
function RatingBadge({ rating }: { rating: number }) {
	let tone = styles.toneRed;
	if (rating >= 16) {
		tone = styles.toneGreen;
	} else if (rating >= 12) {
		tone = styles.toneTeal;
	} else if (rating >= 8) {
		tone = styles.toneAmber;
	}
	return (
		<span className={joinClassNames(styles.rating, tone)}>
			{rating}
			<span className={styles.ratingScale}>/20</span>
		</span>
	);
}

/** Champ d'un formulaire de modale : son libellé au-dessus, une aide éventuelle en dessous */
function FormField({
	label,
	hint,
	isGroup = false,
	className,
	children,
}: {
	label: string;
	hint?: ReactNode;
	/** Plusieurs champs (boutons radio, cases) : pas de <label>, qui ne viserait que le premier */
	isGroup?: boolean;
	className?: string | undefined;
	children: ReactNode;
}) {
	const content = (
		<>
			<span className={styles.formLabel}>{label}</span>
			{children}
			{hint !== undefined && hint !== null && (
				<span className={styles.formHint}>{hint}</span>
			)}
		</>
	);
	return isGroup ? (
		<div className={joinClassNames(styles.formField, className)}>{content}</div>
	) : (
		<label className={joinClassNames(styles.formField, className)}>
			{content}
		</label>
	);
}

/** Titre d'une section de modale, avec un compteur éventuel (« 2 / 5 ») */
function SectionTitle({
	count,
	children,
}: {
	count?: string | undefined;
	children: ReactNode;
}) {
	return (
		<h3 className={styles.sectionTitle}>
			{children}
			{count !== undefined && (
				<span className={styles.sectionCount}>{count}</span>
			)}
		</h3>
	);
}

// ---------- Recherche ----------

/**
 * Numéro dans la série, tapé « 3 » ou « 3.1 » (section 8) ; `entries`, les autres jeux de la série, servent à le lire et à l'afficher.
 * `isLive` : chaque frappe valable est prise ; sinon, le numéro l'est en quittant le champ, ou avec Entrée.
 * Un numéro refusé (sous 1, plus de 3 décimales) remet le champ au dernier numéro accepté.
 */
function SeriesNumberField({
	value,
	entries,
	isLive,
	className,
	ariaLabel,
	onCommit,
}: {
	value: number | null;
	entries: SeriesEntry[];
	isLive: boolean;
	className?: string;
	ariaLabel?: string;
	onCommit: (seriesNumber: number) => void;
}) {
	const text = value === null ? "" : formatSeriesNumber(value, entries);
	return (
		<input
			// Pris à la sortie du champ : le champ repart du numéro rangé
			key={isLive ? undefined : text}
			type="text"
			inputMode="decimal"
			className={joinClassNames(styles.seriesNumberField, className)}
			aria-label={ariaLabel}
			defaultValue={text}
			onKeyDown={blurOnEnter}
			onChange={(event) => {
				const seriesNumber = parseSeriesNumber(event.target.value, entries);
				if (isLive && seriesNumber !== null) {
					onCommit(seriesNumber);
				}
			}}
			onBlur={(event) => {
				const input = event.currentTarget;
				const seriesNumber = parseSeriesNumber(input.value, entries);
				if (seriesNumber === null) {
					input.value = text;
				} else if (!isLive && seriesNumber !== value) {
					onCommit(seriesNumber);
				}
			}}
		/>
	);
}

/**
 * Résultat actif d'une liste parcourue au clavier depuis son champ (motif « combobox ») : ↓ et ↑ le déplacent, Entrée le choisit.
 * Il repart de zéro quand `resetKey` change (nouvelle recherche, autre filtre).
 */
function useActiveIndex(resetKey: unknown) {
	const [activeIndex, setActiveIndex] = useState(-1);
	const [activeKey, setActiveKey] = useState(resetKey);
	if (resetKey !== activeKey) {
		setActiveKey(resetKey);
		setActiveIndex(-1);
	}
	return [activeIndex, setActiveIndex] as const;
}

/** ↓, ↑ et Entrée dans le champ d'une liste de résultats ; `true` si la touche a servi */
function navigateResults(
	event: { key: string; preventDefault: () => void },
	activeIndex: number,
	count: number,
	setActiveIndex: (index: number) => void,
	selectActive: () => void,
): boolean {
	if (count === 0) {
		return false;
	}
	if (event.key === "ArrowDown") {
		event.preventDefault();
		setActiveIndex(Math.min(activeIndex + 1, count - 1));
		return true;
	}
	if (event.key === "ArrowUp") {
		event.preventDefault();
		setActiveIndex(Math.max(activeIndex - 1, 0));
		return true;
	}
	if (event.key === "Enter" && activeIndex >= 0) {
		event.preventDefault();
		selectActive();
		return true;
	}
	return false;
}

/** Le résultat actif reste visible quand la liste défile */
function useScrollIntoView(elementId: string | undefined) {
	useEffect(() => {
		if (elementId !== undefined) {
			document.getElementById(elementId)?.scrollIntoView({ block: "nearest" });
		}
	}, [elementId]);
}

/** Une ligne de résultat : miniature, noms, année, plateformes (3 au plus, puis le nombre restant), « via … » ; `badge` à droite */
function SearchResultOption({
	id,
	result,
	isActive,
	badge,
	onHover,
	onSelect,
}: {
	id: string;
	result: SearchResult;
	isActive: boolean;
	badge: ReactNode;
	onHover: () => void;
	onSelect: (result: SearchResult) => void;
}) {
	const shownPlatformNames = result.platformNames.slice(0, 3);
	const hiddenPlatformCount =
		result.platformNames.length - shownPlatformNames.length;

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events -- le clavier passe par le champ de la liste (combobox)
		<li
			id={id}
			role="option"
			aria-selected={isActive}
			tabIndex={-1}
			className={joinClassNames(styles.result, isActive && styles.activeResult)}
			onPointerMove={() => {
				if (!isActive) {
					onHover();
				}
			}}
			onClick={() => onSelect(result)}
		>
			<Thumbnail imageId={result.coverImageId} />
			<span className={styles.resultText}>
				<span className={styles.resultName}>
					<strong>{result.frenchName ?? result.name}</strong>
					{result.releaseYear !== null && (
						<span className={styles.resultYear}>{result.releaseYear}</span>
					)}
				</span>
				{result.frenchName !== null && (
					<span className={styles.secondaryName}>{result.name}</span>
				)}
				{(shownPlatformNames.length > 0 || result.matchedName !== null) && (
					<span className={styles.resultMeta}>
						{shownPlatformNames.map((platformName) => (
							<span
								key={platformName}
								className={styles.platform}
							>
								{platformName}
							</span>
						))}
						{hiddenPlatformCount > 0 && (
							<span className={styles.morePlatforms}>
								+{hiddenPlatformCount}
							</span>
						)}
						{/* Trouvé par une autre fiche que la sienne : édition, bundle, DLC… */}
						{result.matchedName !== null && (
							<span className={styles.matchedName}>
								<CornerDownRight aria-hidden />
								via « {result.matchedName} »
							</span>
						)}
					</span>
				)}
			</span>
			{badge}
		</li>
	);
}

/**
 * Recherche sur IGDB seulement ; les jeux en base hors backlog passent par « Ma base » (section 8).
 * Le curseur reste dans le champ : ↓ et ↑ parcourent les résultats, Entrée choisit, Échap ferme la liste.
 */
function SearchBar({
	query,
	isOpen,
	results,
	isSearching,
	error,
	database,
	inputRef,
	onQueryChange,
	onOpenChange,
	onSelect,
}: {
	query: string;
	isOpen: boolean;
	results: SearchResult[];
	isSearching: boolean;
	error: string | null;
	database: Database;
	inputRef: RefObject<HTMLInputElement | null>;
	onQueryChange: (query: string) => void;
	onOpenChange: (isOpen: boolean) => void;
	onSelect: (result: SearchResult) => void;
}) {
	const listId = useId();
	const [activeIndex, setActiveIndex] = useActiveIndex(results);
	const isListShown = isOpen && query.trim() !== "";
	const activeResultId =
		isListShown && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;
	useScrollIntoView(activeResultId);

	let fieldEnd: ReactNode = (
		<kbd
			className={styles.searchShortcut}
			aria-hidden
		>
			/
		</kbd>
	);
	if (isSearching) {
		fieldEnd = <Spinner className={styles.searchSpinner} />;
	} else if (query !== "") {
		fieldEnd = (
			<Button
				icon={X}
				variant="ghost"
				size="sm"
				ariaLabel="Effacer la recherche"
				className={styles.searchClear}
				onClick={() => {
					onQueryChange("");
					inputRef.current?.focus();
				}}
			/>
		);
	}

	return (
		<div
			className={styles.search}
			data-search
		>
			<Search
				className={styles.searchIcon}
				aria-hidden
			/>
			<input
				ref={inputRef}
				type="search"
				role="combobox"
				className={styles.searchInput}
				placeholder="Rechercher un jeu sur IGDB"
				aria-label="Rechercher un jeu sur IGDB"
				aria-expanded={isListShown}
				aria-controls={isListShown ? listId : undefined}
				aria-autocomplete="list"
				aria-activedescendant={activeResultId}
				value={query}
				onChange={(event) => onQueryChange(event.target.value)}
				onFocus={() => onOpenChange(true)}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						onOpenChange(false);
					} else if (!isOpen && event.key === "ArrowDown") {
						onOpenChange(true);
					} else if (isListShown) {
						navigateResults(
							event,
							activeIndex,
							results.length,
							setActiveIndex,
							() => {
								const result = results.at(activeIndex);
								if (result !== undefined) {
									onSelect(result);
								}
							},
						);
					}
				}}
			/>
			{fieldEnd}
			{isListShown && (
				<div className={styles.searchPanel}>
					{error !== null && (
						<p
							className={joinClassNames(
								styles.listMessage,
								styles.errorMessage,
							)}
							role="alert"
						>
							<CircleAlert aria-hidden />
							{error}
						</p>
					)}
					{isSearching && results.length === 0 && (
						<p className={styles.listMessage}>
							<Spinner />
							Recherche sur IGDB…
						</p>
					)}
					{!isSearching && error === null && results.length === 0 && (
						<p className={styles.listMessage}>
							<SearchX aria-hidden />
							Aucun résultat pour « {query.trim()} »
						</p>
					)}
					{results.length > 0 && (
						<ul
							id={listId}
							role="listbox"
							aria-label="Résultats IGDB"
							className={styles.resultList}
							// Le curseur reste dans le champ pendant le choix à la souris
							onMouseDown={(event) => event.preventDefault()}
						>
							{results.map((result, index) => (
								<SearchResultOption
									key={result.id}
									id={`${listId}-${index}`}
									result={result}
									isActive={index === activeIndex}
									badge={
										database.versions.some(({ id }) => id === result.id) && (
											<span
												className={joinClassNames(
													styles.badge,
													styles.toneGreen,
												)}
											>
												<DatabaseIcon aria-hidden />
												Déjà en base
											</span>
										)
									}
									onHover={() => setActiveIndex(index)}
									onSelect={onSelect}
								/>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}

/**
 * « Ma base » (section 8) : les jeux en base hors backlog, triés par nom, filtrés sans requête IGDB.
 * 50 jeux, puis la page suivante à l'approche du bas de la liste. Un jeu choisi ouvre l'ajout au backlog.
 * Comme la recherche, la liste se parcourt au clavier depuis le filtre.
 */
function AddFromDatabaseModal({
	modal,
	database,
	onModalChange,
	onSelect,
	onCancel,
}: {
	modal: Extract<Modal, { kind: "addFromDatabase" }>;
	database: Database;
	onModalChange: (modal: Extract<Modal, { kind: "addFromDatabase" }>) => void;
	onSelect: (result: SearchResult) => void;
	onCancel: () => void;
}) {
	const games = searchDatabaseGames(database, modal.query);
	const shownGames = games.slice(0, modal.loadedPageCount * databasePageSize);
	const hasMoreGames = shownGames.length < games.length;
	const listRef = useRef<HTMLUListElement>(null);
	const loadMoreRef = useRef<HTMLLIElement>(null);
	const filterRef = useRef<HTMLInputElement>(null);
	const listId = useId();
	const [activeIndex, setActiveIndex] = useActiveIndex(modal.query);
	const activeResultId =
		activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;
	useScrollIntoView(activeResultId);

	// Défilement infini dans la liste, qui défile seule sous le filtre
	useEffect(() => {
		const list = listRef.current;
		const loadMore = loadMoreRef.current;
		if (!hasMoreGames || list === null || loadMore === null) {
			return undefined;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some(({ isIntersecting }) => isIntersecting)) {
					onModalChange({
						...modal,
						loadedPageCount: modal.loadedPageCount + 1,
					});
				}
			},
			{ root: list, rootMargin: "0px 0px 400px 0px" },
		);
		observer.observe(loadMore);
		return () => observer.disconnect();
	}, [hasMoreGames, modal, onModalChange]);

	return (
		<ModalDialog
			title="Ajouter depuis ma base"
			subtitle="Les jeux déjà en base, hors du backlog : sans passer par IGDB"
			icon={LibraryBig}
			initialFocusRef={filterRef}
			actions={<Button onClick={onCancel}>Annuler</Button>}
			onClose={onCancel}
		>
			<div className={styles.filterBox}>
				<Search
					className={styles.filterBoxIcon}
					aria-hidden
				/>
				<input
					ref={filterRef}
					type="search"
					role="combobox"
					className={styles.filterBoxInput}
					placeholder="Filtrer par nom ou titre de version"
					aria-label="Filtrer les jeux de ma base"
					aria-expanded={games.length > 0}
					aria-controls={games.length > 0 ? listId : undefined}
					aria-autocomplete="list"
					aria-activedescendant={activeResultId}
					value={modal.query}
					onChange={(event) =>
						onModalChange({
							...modal,
							query: event.target.value,
							loadedPageCount: 1,
						})
					}
					onKeyDown={(event) =>
						navigateResults(
							event,
							activeIndex,
							shownGames.length,
							setActiveIndex,
							() => {
								const game = shownGames.at(activeIndex);
								if (game !== undefined) {
									onSelect(mapDatabaseSearchResult(database, game));
								}
							},
						)
					}
				/>
			</div>
			{games.length === 0 ? (
				<p className={joinClassNames(styles.listMessage, styles.listBox)}>
					<SearchX aria-hidden />
					{modal.query.trim() === ""
						? "Tous les jeux de la base sont dans le backlog"
						: "Aucun résultat"}
				</p>
			) : (
				<ul
					ref={listRef}
					id={listId}
					role="listbox"
					aria-label="Jeux de ma base"
					className={joinClassNames(styles.resultList, styles.databaseList)}
					onMouseDown={(event) => event.preventDefault()}
				>
					{shownGames.map((game, index) => (
						<SearchResultOption
							key={game.id}
							id={`${listId}-${index}`}
							result={mapDatabaseSearchResult(database, game)}
							isActive={index === activeIndex}
							badge={null}
							onHover={() => setActiveIndex(index)}
							onSelect={onSelect}
						/>
					))}
					{hasMoreGames && (
						<li
							ref={loadMoreRef}
							role="presentation"
							className={styles.listMessage}
						>
							<Spinner />
							{games.length - shownGames.length} jeux de plus…
						</li>
					)}
				</ul>
			)}
		</ModalDialog>
	);
}

// ---------- Modales (sections 6 et 8) ----------

/** Version puis plateforme d'une nouvelle version jouée : plateformes de la version, puis émulateurs de ces consoles */
function VersionPlatformFields({
	gameName,
	versions,
	versionPlatforms,
	platforms,
	userVersions,
	draft,
	onChange,
}: {
	gameName: string;
	versions: Version[];
	versionPlatforms: VersionPlatform[];
	platforms: Platform[];
	userVersions: UserVersion[];
	draft: UserVersionDraft;
	onChange: (draft: UserVersionDraft) => void;
}) {
	const { versionId, platformId } = draft;
	const platformOptions =
		versionId === null
			? []
			: getPlatformOptions(versionId, versionPlatforms, platforms);

	return (
		<div className={styles.formRow}>
			<FormField
				label="Version"
				className={styles.versionField}
			>
				<Select
					value={versionId === null ? null : String(versionId)}
					options={versions.map((version) => ({
						value: String(version.id),
						label: getVersionLabel(
							version,
							gameName,
							versionPlatforms,
							platforms,
						),
					}))}
					placeholder="Choisir la version"
					ariaLabel="Version"
					className={styles.fullWidth}
					onChange={(value) =>
						onChange({
							...draft,
							versionId: Number(value),
							platformId: null,
						})
					}
				/>
			</FormField>
			<FormField label="Plateforme">
				<Select
					value={platformId === null ? null : String(platformId)}
					options={platformOptions.map((platform) => {
						const isInBacklog = userVersions.some(
							(userVersion) =>
								userVersion.versionId === versionId &&
								userVersion.platformId === platform.id,
						);
						let hint: string | undefined;
						if (isInBacklog) {
							hint = "déjà dans le backlog";
						} else if (platform.emulatedPlatformId !== null) {
							hint = "émulateur";
						}
						return {
							value: String(platform.id),
							label: platform.shortName,
							hint,
							disabled: isInBacklog,
						};
					})}
					placeholder={
						versionId === null ? "D’abord la version" : "Choisir la plateforme"
					}
					ariaLabel="Plateforme"
					disabled={versionId === null}
					className={styles.fullWidth}
					onChange={(value) =>
						onChange({ ...draft, platformId: Number(value) })
					}
				/>
			</FormField>
		</div>
	);
}

/**
 * Personnalisation d'un jeu du backlog (section 8), à l'ajout au backlog ou par « Personnaliser » :
 * miniature, type de fin, série et numéro dans la série. `imageIds` à `null` : images IGDB en cours de chargement.
 * Choisir une série pré-remplit le numéro (section 8).
 */
function UserGameFields({
	gameId,
	draft,
	proposedSeries,
	database,
	imageIds,
	imageError,
	onChange,
}: {
	gameId: number;
	draft: UserGameDraft;
	proposedSeries: Series | null;
	database: Database;
	imageIds: IgdbImageId[] | null;
	imageError: string | null;
	onChange: (draft: UserGameDraft) => void;
}) {
	const endingType = endingTypeDefinitions.find(
		({ key }) => key === draft.endingType,
	);
	// En attendant IGDB, ou s'il échoue, seule l'image déjà choisie est proposée
	const shownImageIds =
		imageIds ?? (draft.imageId === null ? [] : [draft.imageId]);
	// La série proposée par IGDB est en tête de liste ; les autres séries de la base suivent, par nom
	const otherSeries = database.series
		.filter(({ id }) => id !== proposedSeries?.id)
		.toSorted((first, second) => first.name.localeCompare(second.name));
	const seriesValue = formatSeriesValue(draft.series, proposedSeries !== null);
	const hasSeries =
		seriesValue !== "none" &&
		!(seriesValue === "proposed" && proposedSeries === null);
	const seriesNumberOwner = hasSeries
		? findSeriesNumberOwner(database, gameId, draft)
		: null;
	const seriesEntries = getDraftSeriesEntries(database, gameId, draft.series);

	function changeSeries(series: SeriesChoice) {
		onChange({
			...draft,
			series,
			seriesNumber: getDefaultSeriesNumber(database, gameId, series),
		});
	}

	// La série proposée par IGDB d'abord, puis « Aucune », les autres séries et la création d'une série
	const seriesOptions: SelectOption<string>[] = [
		{
			value: "proposed",
			label:
				proposedSeries === null
					? "Aucune (IGDB n’en propose pas)"
					: `${proposedSeries.name} (IGDB)`,
			content:
				proposedSeries === null ? (
					"Aucune (IGDB n’en propose pas)"
				) : (
					<span className={styles.optionWithTag}>
						{proposedSeries.name}
						<span className={styles.tag}>IGDB</span>
					</span>
				),
		},
		...(proposedSeries === null ? [] : [{ value: "none", label: "Aucune" }]),
		...otherSeries.map(({ id, name }) => ({
			value: `other-${id}`,
			label: name,
		})),
		{
			value: "new",
			label: "Nouvelle série…",
			content: (
				<span className={styles.optionWithIcon}>
					<Plus aria-hidden />
					Nouvelle série…
				</span>
			),
		},
	];

	return (
		<div className={styles.formStack}>
			<FormField
				label="Miniature"
				isGroup
			>
				{imageIds === null && imageError === null && (
					<span className={styles.inlineStatus}>
						<Spinner />
						Chargement des images IGDB…
					</span>
				)}
				{imageError !== null && <Callout tone="danger">{imageError}</Callout>}
				{imageIds !== null && shownImageIds.length === 0 && (
					<span className={styles.inlineStatus}>Aucune image sur IGDB</span>
				)}
				{shownImageIds.length > 0 && (
					<div className={styles.imageChoices}>
						{shownImageIds.map((imageId, index) => (
							<button
								key={imageId}
								type="button"
								className={joinClassNames(
									styles.imageChoice,
									imageId === draft.imageId && styles.selectedImageChoice,
								)}
								aria-pressed={imageId === draft.imageId}
								aria-label={`Image ${index + 1} sur ${shownImageIds.length}`}
								onClick={() => onChange({ ...draft, imageId })}
							>
								<Thumbnail
									imageId={imageId}
									size="lg"
								/>
								{imageId === draft.imageId && (
									<span className={styles.imageChoiceCheck}>
										<Check aria-hidden />
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</FormField>

			<FormField
				label="Type de fin"
				hint={endingType?.meaning}
				isGroup
			>
				<SegmentedControl
					value={draft.endingType}
					options={endingTypeDefinitions.map(({ key, label }) => ({
						value: key,
						label,
						icon: endingTypeIcons[key],
					}))}
					ariaLabel="Type de fin"
					onChange={(nextEndingType) =>
						onChange({ ...draft, endingType: nextEndingType })
					}
				/>
			</FormField>

			<div className={styles.formRow}>
				<FormField label="Série">
					<Select
						value={seriesValue}
						options={seriesOptions}
						ariaLabel="Série"
						className={styles.seriesSelect}
						onChange={(value) => changeSeries(parseSeriesValue(value))}
					/>
				</FormField>
				{draft.series.kind === "new" && (
					<FormField label="Nom de la nouvelle série">
						<input
							type="text"
							className={styles.textInput}
							value={draft.series.name}
							placeholder="Ex. Souls"
							// eslint-disable-next-line jsx-a11y/no-autofocus -- le champ apparaît au choix de « Nouvelle série »
							autoFocus
							onChange={(event) =>
								onChange({
									...draft,
									series: { kind: "new", name: event.target.value },
								})
							}
						/>
					</FormField>
				)}
				{hasSeries && (
					<FormField label="N° dans la série">
						<SeriesNumberField
							// Un autre choix de série pré-remplit un autre numéro
							key={seriesValue}
							value={draft.seriesNumber}
							entries={seriesEntries}
							isLive
							onCommit={(seriesNumber) => onChange({ ...draft, seriesNumber })}
						/>
					</FormField>
				)}
				{seriesValue !== "proposed" && (
					<Button
						icon={Undo2}
						variant="ghost"
						tooltip={`Revenir à la série proposée par IGDB : ${proposedSeries?.name ?? "aucune"}`}
						className={styles.formRowButton}
						onClick={() => changeSeries({ kind: "proposed" })}
					>
						Série IGDB
					</Button>
				)}
			</div>
			{draft.seriesNumber !== null && seriesNumberOwner !== null && (
				<Callout>
					N° {formatSeriesNumber(draft.seriesNumber, seriesEntries)} déjà pris
					par {seriesNumberOwner.frenchName ?? seriesNumberOwner.name} : il sera
					décalé d’un cran, avec les suivants si besoin.
				</Callout>
			)}
		</div>
	);
}

/** Plateformes d'une version avec leur date de sortie, ex. « PS3 11/11/2011 · PC 11/11/2011 » */
function VersionPlatformDates({
	versionId,
	versionPlatforms,
	platforms,
}: {
	versionId: number;
	versionPlatforms: VersionPlatform[];
	platforms: Platform[];
}) {
	return (
		<span className={styles.platformDates}>
			{versionPlatforms
				.filter((versionPlatform) => versionPlatform.versionId === versionId)
				.map(({ platformId, releaseDate }) => (
					<span
						key={platformId}
						className={styles.platformDate}
					>
						<span className={styles.platform}>
							{platforms.find(({ id }) => id === platformId)?.shortName ??
								`#${platformId}`}
						</span>
						<span className={styles.number}>
							{releaseDate === null
								? "date inconnue"
								: formatIsoDate(releaseDate)}
						</span>
					</span>
				))}
		</span>
	);
}

/**
 * Tout ce qui est stocké en base globale, en lecture seule (section 8) ; seules les versions et les DLC se cochent (`selection`),
 * ce qui est déjà en base l'étant d'office. Un DLC peut aussi être coché « comme jeu », pour l'ajouter ensuite comme jeu à part (section 5).
 */
function GamePreview({
	gameImport,
	database,
	selection,
	onSelectionChange,
}: {
	gameImport: GameImport;
	database: Database;
	selection: ImportSelection;
	onSelectionChange: (selection: ImportSelection) => void;
}) {
	const {
		game,
		versions,
		versionPlatforms,
		platforms,
		dlcs,
		proposedSeries,
		developer,
		publisher,
		warnings,
	} = gameImport;
	const originalVersion = versions.find(({ id }) => id === game.id);
	// L'originale est toujours enregistrée ; une version ou un DLC déjà en base reste coché
	function isVersionLocked(versionId: number): boolean {
		return (
			versionId === game.id || findById(database.versions, versionId) !== null
		);
	}
	function isVersionChecked(versionId: number): boolean {
		return (
			isVersionLocked(versionId) || selection.versionIds.includes(versionId)
		);
	}
	function isDlcStored(dlcId: number): boolean {
		return findById(database.dlcs, dlcId) !== null;
	}
	function isDlcChecked(dlcId: number): boolean {
		return isDlcStored(dlcId) || selection.dlcIds.includes(dlcId);
	}

	return (
		<div className={styles.preview}>
			<section className={styles.previewHero}>
				<Cover imageId={originalVersion?.coverImageId ?? null} />
				<div className={styles.previewHeading}>
					<p className={styles.previewName}>{game.frenchName ?? game.name}</p>
					{game.frenchName !== null && (
						<p className={styles.secondaryName}>{game.name}</p>
					)}
					<p className={styles.previewMeta}>
						<span className={styles.previewRelease}>
							<CalendarDays aria-hidden />
							Sortie :
							<ReleaseDateLabel
								date={game.firstReleaseDate}
								isCancelled={game.isCancelled}
							/>
						</span>
						{originalVersion !== undefined && (
							<a
								className={styles.externalLink}
								href={originalVersion.igdbUrl}
								target="_blank"
								rel="noreferrer"
							>
								Ouvrir sur IGDB
								<ExternalLink aria-hidden />
							</a>
						)}
					</p>
				</div>
			</section>

			<dl className={styles.facts}>
				<div className={styles.fact}>
					<dt>Série proposée</dt>
					<dd>{proposedSeries?.name ?? "—"}</dd>
				</div>
				<div className={styles.fact}>
					<dt>Développeur</dt>
					<dd>
						<CompanyLabel company={developer} />
					</dd>
				</div>
				<div className={styles.fact}>
					<dt>Éditeur</dt>
					<dd>
						<CompanyLabel company={publisher} />
					</dd>
				</div>
			</dl>

			<section>
				<SectionTitle
					count={`${versions.filter(({ id }) => isVersionChecked(id)).length} / ${versions.length}`}
				>
					Versions à enregistrer
				</SectionTitle>
				<ul className={styles.choiceList}>
					{versions.map((version) => {
						const isOriginal = version.id === game.id;
						let lockReason: string | null = null;
						if (isOriginal) {
							lockReason = "Toujours enregistrée : c’est la fiche du jeu";
						} else if (isVersionLocked(version.id)) {
							lockReason = "Déjà en base";
						}
						return (
							<li
								key={version.id}
								className={styles.choiceItem}
							>
								<Checkbox
									checked={isVersionChecked(version.id)}
									disabled={isVersionLocked(version.id)}
									tooltip={lockReason}
									label={
										<span className={styles.optionWithTag}>
											<strong>{version.title ?? game.name}</strong>
											{isOriginal && (
												<span className={styles.tag}>Originale</span>
											)}
										</span>
									}
									description={
										<VersionPlatformDates
											versionId={version.id}
											versionPlatforms={versionPlatforms}
											platforms={platforms}
										/>
									}
									onChange={() =>
										onSelectionChange({
											...selection,
											versionIds: toggleId(selection.versionIds, version.id),
										})
									}
								/>
							</li>
						);
					})}
				</ul>
			</section>

			<section>
				<SectionTitle
					count={`${dlcs.filter(({ id }) => isDlcChecked(id)).length} / ${dlcs.length}`}
				>
					DLC à enregistrer
				</SectionTitle>
				{dlcs.length === 0 ? (
					<p className={styles.emptyHint}>Aucun DLC</p>
				) : (
					<ul className={styles.choiceList}>
						{dlcs.map(({ id, name }) => {
							const isGameStored = findById(database.games, id) !== null;
							return (
								<li
									key={id}
									className={joinClassNames(
										styles.choiceItem,
										styles.dlcChoice,
									)}
								>
									<Checkbox
										checked={isDlcChecked(id)}
										disabled={isDlcStored(id)}
										tooltip={isDlcStored(id) ? "Déjà en base" : null}
										label={name}
										onChange={() =>
											onSelectionChange({
												...selection,
												dlcIds: toggleId(selection.dlcIds, id),
											})
										}
									/>
									{/* Indépendante de la case DLC : un DLC peut être les deux (section 5) */}
									<Checkbox
										variant="chip"
										icon={Puzzle}
										label="Comme jeu"
										ariaLabel={`${name} : comme jeu`}
										checked={selection.dlcAsGameIds.includes(id)}
										disabled={isGameStored}
										tooltip={
											isGameStored
												? "Déjà en base comme jeu"
												: "Après « Valider », ouvre l’ajout de ce DLC comme jeu à part ; il peut rester DLC en même temps"
										}
										onChange={() =>
											onSelectionChange({
												...selection,
												dlcAsGameIds: toggleId(selection.dlcAsGameIds, id),
											})
										}
									/>
								</li>
							);
						})}
					</ul>
				)}
			</section>

			{warnings.length > 0 && (
				<Callout tone="warning">
					<p className={styles.calloutTitle}>
						Données IGDB hors modèle ({warnings.length})
					</p>
					{warnings.map(({ message, entryJson }) => (
						<details
							key={entryJson}
							className={styles.warningDetails}
						>
							<summary>{message}</summary>
							<pre>{entryJson}</pre>
						</details>
					))}
				</Callout>
			)}
		</div>
	);
}

function ModalActions({
	validateLabel = "Valider",
	cancelLabel = "Annuler",
	canValidate,
	onCancel,
	onValidate,
}: {
	validateLabel?: string;
	cancelLabel?: string;
	canValidate: boolean;
	onCancel: () => void;
	onValidate: () => void;
}) {
	return (
		<>
			<Button onClick={onCancel}>{cancelLabel}</Button>
			<Button
				variant="primary"
				icon={Check}
				disabled={!canValidate}
				onClick={onValidate}
			>
				{validateLabel}
			</Button>
		</>
	);
}

/** Données IGDB en cours de chargement, ou leur échec */
function LoadingState({
	error,
	children,
}: {
	error: string | null;
	children: ReactNode;
}) {
	return error === null ? (
		<div className={styles.loadingState}>
			<Spinner className={styles.loadingSpinner} />
			{children}
		</div>
	) : (
		<Callout tone="danger">{error}</Callout>
	);
}

function AddGameModal({
	modal,
	database,
	error,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "addGame" }>;
	database: Database;
	error: string | null;
	onModalChange: (modal: Extract<Modal, { kind: "addGame" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	const { gameImport } = modal;

	return (
		<ModalDialog
			title="Ajouter un jeu"
			subtitle="Ce qui sera enregistré en base, tel que le donne IGDB"
			icon={Plus}
			size="lg"
			footerStart={
				<Checkbox
					checked={modal.isAddingToBacklog}
					label="Ajouter à mon backlog"
					tooltip="Après « Valider », ouvre l’ajout au backlog : personnalisation, version jouée, plateforme et tes données"
					onChange={() =>
						onModalChange({
							...modal,
							isAddingToBacklog: !modal.isAddingToBacklog,
						})
					}
				/>
			}
			actions={
				<ModalActions
					canValidate={gameImport !== null}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
			onClose={onCancel}
		>
			{gameImport === null ? (
				<LoadingState error={error}>Chargement des données IGDB…</LoadingState>
			) : (
				<div className={styles.formStack}>
					{database.games.some(({ id }) => id === gameImport.game.id) && (
						<Callout>
							Ce jeu est déjà en base : seules les fiches manquantes
							s’ajouteront.
						</Callout>
					)}
					<GamePreview
						gameImport={gameImport}
						database={database}
						selection={modal.selection}
						onSelectionChange={(selection) =>
							onModalChange({ ...modal, selection })
						}
					/>
				</div>
			)}
		</ModalDialog>
	);
}

/**
 * « Modifier le jeu » (section 8) : la même modale, données de la base en lecture seule.
 * IGDB est relu à l'ouverture : ses versions et DLC absents de la base, à cocher pour les ajouter.
 */
function EditGameModal({
	modal,
	database,
	error,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "editGame" }>;
	database: Database;
	error: string | null;
	onModalChange: (modal: Extract<Modal, { kind: "editGame" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	const game = findById(database.games, modal.gameId);
	const isLoadingIgdb = modal.gameImport === null && error === null;

	return (
		<ModalDialog
			title="Modifier le jeu"
			subtitle="Ajouter les versions et DLC IGDB qui manquent en base"
			icon={SquarePen}
			size="lg"
			actions={
				// Sans rien de coché en plus, « Valider » reste inactif ; un DLC coché « comme jeu » compte comme un changement
				<ModalActions
					canValidate={
						hasGameEditChanges(database, modal) ||
						modal.selection.dlcAsGameIds.length > 0
					}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
			onClose={onCancel}
		>
			{game === null ? (
				<Callout tone="danger">Jeu introuvable en base.</Callout>
			) : (
				<div className={styles.formStack}>
					{error !== null && <Callout tone="danger">{error}</Callout>}
					{isLoadingIgdb && (
						<Callout tone="loading">
							Chargement des versions et DLC IGDB absents de la base…
						</Callout>
					)}
					<GamePreview
						gameImport={mapEditGameImport(database, game, modal.gameImport)}
						database={database}
						selection={modal.selection}
						onSelectionChange={(selection) =>
							onModalChange({ ...modal, selection })
						}
					/>
				</div>
			)}
		</ModalDialog>
	);
}

/** « Personnaliser » (section 8) : miniature, type de fin, série et numéro d'un jeu du backlog ; IGDB est relu à l'ouverture pour les images */
function CustomizeGameModal({
	modal,
	database,
	error,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "customizeGame" }>;
	database: Database;
	error: string | null;
	onModalChange: (modal: Extract<Modal, { kind: "customizeGame" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	const game = findById(database.games, modal.gameId);
	const userGame = findUserGame(database, modal.gameId);

	return (
		<ModalDialog
			title="Personnaliser"
			subtitle={
				game === null ? "Jeu introuvable" : (game.frenchName ?? game.name)
			}
			icon={Palette}
			actions={
				// Sans rien de changé, ou sans nom pour une nouvelle série, « Valider » reste inactif
				<ModalActions
					canValidate={
						isSeriesChoiceValid(modal.draft.series) &&
						hasUserGameChanges(database, modal.gameId, modal.draft)
					}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
			onClose={onCancel}
		>
			{game === null || userGame === null ? (
				<Callout tone="danger">Jeu introuvable dans le backlog.</Callout>
			) : (
				<div className={styles.formStack}>
					{modal.draft.endingType !== userGame.endingType && (
						<Callout tone="warning">
							Changer le type de fin convertit les statuts devenus incompatibles
							: Fini ↔ Estimé fini, Vu sans jouer → Pas commencé.
						</Callout>
					)}
					<UserGameFields
						gameId={modal.gameId}
						draft={modal.draft}
						proposedSeries={findById(database.series, game.proposedSeriesId)}
						database={database}
						imageIds={modal.imageIds}
						imageError={error}
						onChange={(draft) => onModalChange({ ...modal, draft })}
					/>
				</div>
			)}
		</ModalDialog>
	);
}

/** Décalage d'un sous-jeu dans « Réorganiser la série », en pixels (3,2rem) : glisser de sa moitié vers la droite en fait un sous-jeu */
const subEntryIndentPx = 32;

/**
 * « Réorganiser la série » (section 8) : glisser un jeu par sa poignée sur le trait entre deux lignes, décalé à droite pour en faire
 * un sous-jeu, ou taper son numéro. Un jeu sorti avant un jeu placé plus haut est signalé. Rien n'est enregistré avant « Valider ».
 */
function ReorderSeriesModal({
	modal,
	database,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "reorderSeries" }>;
	database: Database;
	onModalChange: (modal: Extract<Modal, { kind: "reorderSeries" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	// Glisser-déposer en cours : le jeu saisi, d'où il part à l'horizontale, et le trait visé
	const [draggedGameId, setDraggedGameId] = useState<number | null>(null);
	const dragStartX = useRef(0);
	const [gapIndex, setGapIndex] = useState<number | null>(null);
	const [wantsSub, setWantsSub] = useState(false);
	const { entries } = modal;
	const series = findById(database.series, modal.seriesId);
	const conflicts = getSeriesOrderConflicts(database, entries);
	const draggedEntry =
		entries.find((entry) => entry.gameId === draggedGameId) ?? null;
	const dropLevel =
		draggedGameId === null || gapIndex === null
			? null
			: getSeriesDrop(entries, draggedGameId, gapIndex, wantsSub).isSub
				? "sub"
				: "main";

	function endDrag() {
		setDraggedGameId(null);
		setGapIndex(null);
	}

	/** Le trait s'affiche au-dessus de la ligne qui suit, ou sous la dernière */
	function getDropSide(index: number): "above" | "below" | undefined {
		if (gapIndex === index) {
			return "above";
		}
		return gapIndex === entries.length && index === entries.length - 1
			? "below"
			: undefined;
	}

	return (
		<ModalDialog
			title="Réorganiser la série"
			subtitle={series?.name ?? "Série introuvable"}
			icon={ListOrdered}
			actions={
				// Sans numéro changé, « Valider » reste inactif
				<ModalActions
					canValidate={hasSeriesOrderChanges(database, entries)}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
			onClose={onCancel}
		>
			<Callout className={styles.seriesHint}>
				Glisse un jeu par sa poignée entre deux lignes, un peu à droite pour en
				faire un sous-jeu, ou tape son numéro (3, 3.1).
			</Callout>
			<ol className={styles.seriesList}>
				{entries.map(({ gameId, seriesNumber }, index) => {
					const game = findById(database.games, gameId);
					const storedNumber = findUserGame(database, gameId)?.seriesNumber;
					const isChanged = seriesNumber !== storedNumber;
					const conflict = conflicts.get(gameId);
					const otherEntries = entries.filter(
						(entry) => entry.gameId !== gameId,
					);
					return (
						<li
							key={gameId}
							className={styles.seriesEntry}
							data-sub={isSeriesSubNumber(seriesNumber) || undefined}
							data-current={gameId === modal.gameId || undefined}
							data-conflict={conflict !== undefined || undefined}
							data-dragged={gameId === draggedGameId || undefined}
							data-drop-side={getDropSide(index)}
							data-drop-level={
								getDropSide(index) === undefined ? undefined : dropLevel
							}
							onDragOver={(event) => {
								if (draggedEntry === null) {
									return;
								}
								// Autorise le dépôt : la moitié haute de la ligne vise le trait au-dessus, la moitié basse celui en dessous
								event.preventDefault();
								const row = event.currentTarget.getBoundingClientRect();
								setGapIndex(
									event.clientY > row.top + row.height / 2 ? index + 1 : index,
								);
								const indent =
									(isSeriesSubNumber(draggedEntry.seriesNumber)
										? subEntryIndentPx
										: 0) +
									event.clientX -
									dragStartX.current;
								setWantsSub(indent >= subEntryIndentPx / 2);
							}}
							onDrop={(event) => {
								event.preventDefault();
								if (draggedGameId !== null && gapIndex !== null) {
									onModalChange({
										...modal,
										entries: dropSeriesEntry(
											entries,
											draggedGameId,
											gapIndex,
											wantsSub,
										),
									});
								}
								endDrag();
							}}
						>
							<Tooltip content="Glisser pour déplacer">
								<span
									className={styles.dragHandle}
									draggable
									onDragStart={(event) => {
										// Firefox ne lance le glisser qu'avec une donnée ; l'image glissée est toute la ligne
										event.dataTransfer.setData("text/plain", String(gameId));
										const row = event.currentTarget.closest("li");
										if (row !== null) {
											event.dataTransfer.setDragImage(row, 0, 0);
										}
										dragStartX.current = event.clientX;
										setDraggedGameId(gameId);
									}}
									onDragEnd={endDrag}
								>
									<GripVertical aria-hidden />
								</span>
							</Tooltip>
							<Tooltip
								content={
									isChanged
										? `Avant : ${storedNumber === undefined || storedNumber === null ? "aucun" : formatSeriesNumber(storedNumber, otherEntries)}`
										: null
								}
							>
								<SeriesNumberField
									value={seriesNumber}
									entries={otherEntries}
									isLive={false}
									className={joinClassNames(
										styles.seriesEntryNumber,
										isChanged && styles.changedSeriesNumber,
									)}
									ariaLabel={`N° de ${game === null ? `jeu ${gameId}` : (game.frenchName ?? game.name)}`}
									onCommit={(nextNumber) =>
										onModalChange({
											...modal,
											entries: placeSeriesEntry(entries, gameId, nextNumber),
										})
									}
								/>
							</Tooltip>
							{game === null ? (
								<span>Jeu introuvable</span>
							) : (
								<>
									<span className={styles.nameBlock}>
										<span className={styles.primaryName}>
											{game.frenchName ?? game.name}
										</span>
										{game.frenchName !== null && (
											<span className={styles.secondaryName}>{game.name}</span>
										)}
									</span>
									<ReleaseDateLabel
										date={game.firstReleaseDate}
										isCancelled={game.isCancelled}
									/>
								</>
							)}
							<span className={styles.seriesEntryWarning}>
								{conflict !== undefined && (
									<Tooltip
										content={`Sorti avant ${conflict.frenchName ?? conflict.name}, placé plus haut`}
										placement="left"
									>
										<span
											className={styles.conflictIcon}
											role="img"
											aria-label={`Sorti avant ${conflict.frenchName ?? conflict.name}, placé plus haut`}
										>
											<TriangleAlert aria-hidden />
										</span>
									</Tooltip>
								)}
							</span>
						</li>
					);
				})}
			</ol>
		</ModalDialog>
	);
}

/** « Rechercher d'autres DLC » (section 9) : tous les DLC IGDB du jeu ; ceux déjà en base sont cochés d'office, les autres s'ajoutent au jeu */
function AddDlcsModal({
	modal,
	database,
	error,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "addDlcs" }>;
	database: Database;
	error: string | null;
	onModalChange: (modal: Extract<Modal, { kind: "addDlcs" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	const game = findById(database.games, modal.gameId);

	return (
		<ModalDialog
			title="Rechercher d’autres DLC"
			subtitle={
				game === null ? "Jeu introuvable" : (game.frenchName ?? game.name)
			}
			icon={Puzzle}
			actions={
				<ModalActions
					canValidate={modal.dlcIds.length > 0}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
			onClose={onCancel}
		>
			{modal.dlcs === null && (
				<LoadingState error={error}>Chargement des DLC IGDB…</LoadingState>
			)}
			{modal.dlcs?.length === 0 && (
				<p className={styles.emptyHint}>Aucun DLC sur IGDB</p>
			)}
			{modal.dlcs !== null && modal.dlcs.length > 0 && (
				<div className={styles.formStack}>
					<Callout>
						Les DLC cochés rejoignent le jeu : ils s’ajoutent à la liste des DLC
						de toutes ses versions jouées.
					</Callout>
					<ul className={styles.choiceList}>
						{modal.dlcs.map(({ id, name }) => {
							const isStored = findById(database.dlcs, id) !== null;
							return (
								<li
									key={id}
									className={styles.choiceItem}
								>
									<Checkbox
										checked={isStored || modal.dlcIds.includes(id)}
										disabled={isStored}
										tooltip={isStored ? "Déjà en base" : null}
										label={name}
										onChange={() =>
											onModalChange({
												...modal,
												dlcIds: toggleId(modal.dlcIds, id),
											})
										}
									/>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</ModalDialog>
	);
}

/** Données du joueur de la nouvelle version jouée, saisies comme dans le tableau ; les règles du statut s'appliquent à « Valider » (section 6) */
function UserVersionDraftFields({
	draft,
	endingType,
	dlcs,
	onChange,
}: {
	draft: UserVersionDraft;
	endingType: EndingType;
	dlcs: Dlc[];
	onChange: (draft: UserVersionDraft) => void;
}) {
	return (
		<div className={styles.formStack}>
			<div className={styles.formGrid}>
				<FormField label="Statut">
					<Select
						value={draft.status}
						// Liste filtrée par type de fin (section 6)
						options={statusDefinitions
							.filter(({ key }) => isStatusAllowed(key, endingType))
							.map(({ key, label }) => ({
								value: key,
								label,
								content: <StatusBadge status={key} />,
							}))}
						ariaLabel="Statut"
						className={styles.fullWidth}
						onChange={(status) => onChange({ ...draft, status })}
					/>
				</FormField>
				<FormField label="Date de fin">
					<DateField
						value={draft.finishDate}
						label="Date de fin"
						onCommit={(finishDate) => onChange({ ...draft, finishDate })}
					/>
				</FormField>
				<FormField
					label="Fois fini"
					hint="Sûr, puis probable"
				>
					<span className={styles.fieldPair}>
						<NumberField
							value={draft.sureFinishCount}
							min={0}
							max={null}
							isNullable={false}
							label="Fois fini, sûr"
							onCommit={(count) =>
								onChange({ ...draft, sureFinishCount: count ?? 0 })
							}
						/>
						<span className={styles.fieldUnit}>+</span>
						<NumberField
							value={draft.probableFinishCount}
							min={0}
							max={null}
							isNullable={false}
							label="Fois fini, probable"
							onCommit={(count) =>
								onChange({ ...draft, probableFinishCount: count ?? 0 })
							}
						/>
						<span className={styles.fieldUnit}>?</span>
					</span>
				</FormField>
				<FormField label="Temps relevé">
					<DurationField
						minutes={draft.trackedPlayTimeMinutes}
						label="Temps relevé"
						onCommit={(minutes) =>
							onChange({ ...draft, trackedPlayTimeMinutes: minutes })
						}
					/>
				</FormField>
				<FormField label="Temps estimé">
					<DurationField
						minutes={draft.estimatedPlayTimeMinutes}
						label="Temps estimé"
						onCommit={(minutes) =>
							onChange({ ...draft, estimatedPlayTimeMinutes: minutes })
						}
					/>
				</FormField>
				<FormField label="Note">
					<span className={styles.fieldPair}>
						<NumberField
							value={draft.rating}
							min={0}
							max={20}
							isNullable
							label="Note sur 20"
							digits={2}
							placeholder="–"
							onCommit={(rating) => onChange({ ...draft, rating })}
						/>
						<span className={styles.fieldUnit}>/ 20</span>
					</span>
				</FormField>
			</div>
			<div className={styles.switchRow}>
				<Checkbox
					variant="switch"
					checked={draft.isUpNext}
					label="À jouer bientôt"
					onChange={() => onChange({ ...draft, isUpNext: !draft.isUpNext })}
				/>
				<Checkbox
					variant="switch"
					checked={draft.isOwned}
					label="Possédé"
					onChange={() => onChange({ ...draft, isOwned: !draft.isOwned })}
				/>
			</div>
			<FormField label="Commentaire">
				<TextField
					value={draft.comment}
					label="Commentaire"
					placeholder="Une note pour plus tard…"
					onCommit={(comment) => onChange({ ...draft, comment })}
				/>
			</FormField>
			{dlcs.length > 0 && (
				<fieldset className={styles.fieldset}>
					<legend className={styles.formLabel}>DLC faits</legend>
					<ul className={styles.checkGrid}>
						{dlcs.map((dlc) => (
							<li key={dlc.id}>
								<Checkbox
									checked={draft.doneDlcIds.includes(dlc.id)}
									label={dlc.name}
									onChange={() =>
										onChange({
											...draft,
											doneDlcIds: draft.doneDlcIds.includes(dlc.id)
												? draft.doneDlcIds.filter((id) => id !== dlc.id)
												: [...draft.doneDlcIds, dlc.id],
										})
									}
								/>
							</li>
						))}
					</ul>
				</fieldset>
			)}
		</div>
	);
}

/**
 * Ajout au backlog (section 8) : la personnalisation si le jeu n'y est pas encore, puis version, plateforme et données du joueur,
 * toutes optionnelles. Pour un jeu déjà dans le backlog, « Ajouter une version jouée ».
 */
function AddUserVersionModal({
	modal,
	database,
	error,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "addUserVersion" }>;
	database: Database;
	error: string | null;
	onModalChange: (modal: Extract<Modal, { kind: "addUserVersion" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	const game = findById(database.games, modal.gameId);
	const { draft, userGameDraft } = modal;
	const { versionId, platformId } = draft;
	const endingType =
		userGameDraft?.endingType ??
		findUserGame(database, modal.gameId)?.endingType ??
		"story";
	const canValidate =
		versionId !== null &&
		platformId !== null &&
		!database.userVersions.some(
			(userVersion) =>
				userVersion.versionId === versionId &&
				userVersion.platformId === platformId,
		) &&
		(userGameDraft === null || isSeriesChoiceValid(userGameDraft.series));
	const gameName =
		game === null ? "jeu introuvable" : (game.frenchName ?? game.name);

	return (
		<ModalDialog
			title={
				userGameDraft === null
					? "Ajouter une version jouée"
					: "Ajouter au backlog"
			}
			subtitle={gameName}
			icon={userGameDraft === null ? CopyPlus : LibraryBig}
			size="lg"
			actions={
				<ModalActions
					canValidate={canValidate}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
			onClose={onCancel}
		>
			{game !== null && userGameDraft !== null && (
				<section className={styles.modalSection}>
					<SectionTitle>Personnalisation</SectionTitle>
					<UserGameFields
						gameId={modal.gameId}
						draft={userGameDraft}
						proposedSeries={findById(database.series, game.proposedSeriesId)}
						database={database}
						imageIds={modal.imageIds}
						imageError={error}
						onChange={(nextUserGameDraft) =>
							onModalChange({
								...modal,
								userGameDraft: nextUserGameDraft,
								// Le statut pré-rempli suit le type de fin (section 6)
								draft: {
									...draft,
									status: convertStatus(
										draft.status,
										nextUserGameDraft.endingType,
									),
								},
							})
						}
					/>
				</section>
			)}
			<section className={styles.modalSection}>
				<SectionTitle>Version jouée</SectionTitle>
				<div className={styles.formStack}>
					<Callout>
						Choisis la version jouée, puis la plateforme.
						{userGameDraft !== null &&
							" Annuler laisse le jeu en base, hors du backlog."}
					</Callout>
					<VersionPlatformFields
						gameName={game?.name ?? ""}
						versions={database.versions.filter(
							({ gameId }) => gameId === modal.gameId,
						)}
						versionPlatforms={database.versionPlatforms}
						platforms={database.platforms}
						userVersions={database.userVersions}
						draft={draft}
						onChange={(nextDraft) =>
							onModalChange({ ...modal, draft: nextDraft })
						}
					/>
				</div>
			</section>
			{game !== null && (
				<section className={styles.modalSection}>
					<SectionTitle>
						Mes données <span className={styles.optionalTag}>optionnel</span>
					</SectionTitle>
					<UserVersionDraftFields
						draft={draft}
						endingType={endingType}
						dlcs={database.dlcs.filter(({ gameId }) => gameId === game.id)}
						onChange={(nextDraft) =>
							onModalChange({ ...modal, draft: nextDraft })
						}
					/>
				</section>
			)}
		</ModalDialog>
	);
}

/** Proposée au passage d'une version jouée au rang 5 ou plus sans date de fin (section 6) */
function FinishDateModal({
	modal,
	database,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "setFinishDate" }>;
	database: Database;
	onModalChange: (modal: Extract<Modal, { kind: "setFinishDate" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	const userVersion = findById(database.userVersions, modal.userVersionId);
	const version =
		userVersion === null
			? null
			: findById(database.versions, userVersion.versionId);
	const game =
		version === null ? null : findById(database.games, version.gameId);
	const platform =
		userVersion === null
			? null
			: findById(database.platforms, userVersion.platformId);

	return (
		<ModalDialog
			title="Date de fin"
			subtitle={
				<>
					{game === null ? "Ce jeu" : (game.frenchName ?? game.name)}
					{platform === null ? "" : ` sur ${platform.shortName}`}
				</>
			}
			icon={Flag}
			size="sm"
			actions={
				<ModalActions
					cancelLabel="Plus tard"
					canValidate={userVersion !== null}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
			onClose={onCancel}
		>
			<div className={styles.formStack}>
				<p className={styles.modalQuestion}>
					Quand l’as-tu fini pour la première fois ?
				</p>
				<FormField label="Date de fin">
					<DateField
						value={modal.finishDate}
						commitOn="change"
						isNullable={false}
						label="Date de fin"
						onCommit={(finishDate) => {
							if (finishDate !== null) {
								onModalChange({ ...modal, finishDate });
							}
						}}
					/>
				</FormField>
			</div>
		</ModalDialog>
	);
}

// ---------- Tableau (sections 5, 7 et 9) ----------

/** Bulles explicatives des en-têtes : la signification des valeurs */
const columnHelp: Partial<Record<ColumnKey, ReactNode>> = {
	endingType: (
		<dl className={styles.helpList}>
			{endingTypeDefinitions.map(({ key, meaning }) => (
				<div key={key}>
					<dt>
						<EndingTypeLabel endingType={key} />
					</dt>
					<dd>{meaning}</dd>
				</div>
			))}
		</dl>
	),
	status: (
		<dl className={styles.helpList}>
			{statusDefinitions.map(({ key, rank, meaning }) => (
				<div key={key}>
					<dt>
						<span className={styles.helpRank}>{rank ?? "–"}</span>
						<StatusBadge status={key} />
					</dt>
					<dd>{meaning}</dd>
				</div>
			))}
		</dl>
	),
};

/**
 * En-têtes compacts, pour un tableau moins large : une icône ou un mot à la place d'un libellé bien plus large que les valeurs.
 * Le libellé complet reste dans l'info-bulle et pour les lecteurs d'écran.
 */
const compactHeaders: Partial<
	Record<ColumnKey, { icon?: LucideIcon; text?: string }>
> = {
	thumbnail: { icon: ImageIcon },
	seriesNumber: { text: "N°" },
	releaseDate: { text: "Sortie" },
	upNext: { icon: Bookmark },
	owned: { icon: PackageCheck },
	trackedPlayTime: { icon: Timer, text: "Relevé" },
	estimatedPlayTime: { icon: Timer, text: "Estimé" },
	totalPlayTime: { icon: Timer, text: "Total" },
	actions: {},
};

/** Alignement des colonnes : les nombres à droite, les cases et les petites valeurs au centre */
const columnAlignments: Partial<Record<ColumnKey, string>> = {
	seriesNumber: styles.alignCenter,
	upNext: styles.alignCenter,
	owned: styles.alignCenter,
	finishCount: styles.alignEnd,
	dlc: styles.alignCenter,
	trackedPlayTime: styles.alignEnd,
	estimatedPlayTime: styles.alignEnd,
	totalPlayTime: styles.alignEnd,
	rating: styles.alignCenter,
	actions: styles.alignCenter,
};

/**
 * Colonnes collantes au défilement horizontal : le nom, et la miniature quand elle le précède.
 * Elles se calent après la colonne du chevron, la miniature ayant une largeur fixe.
 */
function getStickyColumnClassNames(
	columns: ColumnKey[],
): Partial<Record<ColumnKey, string>> {
	const nameIndex = columns.indexOf("name");
	const thumbnailIndex = columns.indexOf("thumbnail");
	const isThumbnailSticky =
		thumbnailIndex !== -1 && (nameIndex === -1 || thumbnailIndex < nameIndex);
	const classNames: Partial<Record<ColumnKey, string>> = {};
	if (isThumbnailSticky) {
		classNames.thumbnail = joinClassNames(
			styles.stickyCell,
			styles.stickyThumbnail,
			nameIndex === -1 && styles.stickyEdge,
		);
	}
	if (nameIndex !== -1) {
		classNames.name = joinClassNames(
			styles.stickyCell,
			isThumbnailSticky ? styles.stickyNameAfterThumbnail : styles.stickyName,
			styles.stickyEdge,
		);
	}
	return classNames;
}

/** Colonnes propres au jeu, toujours en lecture seule */
const gameInfoRenderers: Partial<
	Record<ColumnKey, (row: GameRow) => ReactNode>
> = {
	thumbnail: (row) => <Thumbnail imageId={row.imageId} />,
	// Nom VF, nom VO en dessous s'il diffère ; ligne à version jouée unique : titre de sa version
	name: (row) => (
		<span className={styles.nameBlock}>
			<span className={styles.primaryName}>{row.frenchName ?? row.name}</span>
			{row.frenchName !== null && (
				<span className={styles.secondaryName}>{row.name}</span>
			)}
			{row.versionTitle !== null && (
				<span className={styles.versionTitle}>
					<Layers aria-hidden />
					{row.versionTitle}
				</span>
			)}
		</span>
	),
	seriesNumber: (row) =>
		row.seriesNumberLabel === null ? null : (
			<span className={styles.number}>{row.seriesNumberLabel}</span>
		),
	developer: (row) =>
		row.developer === null ? null : <CompanyLabel company={row.developer} />,
	publisher: (row) =>
		row.publisher === null ? null : <CompanyLabel company={row.publisher} />,
	releaseDate: (row) => (
		<ReleaseDateLabel
			date={row.releaseDate}
			isCancelled={row.isCancelled}
		/>
	),
	endingType: (row) => <EndingTypeLabel endingType={row.endingType} />,
	platform: (row) =>
		row.platform === null ? null : <PlatformLabel platform={row.platform} />,
};

/** Colonnes propres à la version de la sous-ligne ; les colonnes du jeu y restent vides */
const userVersionInfoRenderers: Partial<
	Record<ColumnKey, (row: UserVersionRow) => ReactNode>
> = {
	thumbnail: (row) => (
		<Thumbnail
			imageId={row.coverImageId}
			size="sm"
		/>
	),
	name: (row) => (
		<span className={styles.subRowName}>
			<CornerDownRight aria-hidden />
			{row.versionTitle ?? "Version originale"}
		</span>
	),
	series: () => null,
	seriesNumber: () => null,
	developer: () => null,
	publisher: () => null,
	releaseDate: (row) => (
		<ReleaseDateLabel
			date={row.releaseDate}
			isCancelled={false}
		/>
	),
	endingType: () => null,
	platform: (row) => <PlatformLabel platform={row.platform} />,
};

/** En-tête : un clic trie (croissant, décroissant, puis sans tri), avec la flèche et le numéro de priorité du critère */
function ColumnHeader({
	column,
	sort,
	className,
	onToggleSort,
}: {
	column: ColumnKey;
	sort: SortCriterion[];
	className: string | undefined;
	onToggleSort: (column: ColumnKey) => void;
}) {
	const help = columnHelp[column];
	const label = getColumnLabel(column);
	const compactHeader = compactHeaders[column];
	const priority = sort.findIndex((criterion) => criterion.column === column);
	const criterion = sort.find((current) => current.column === column);
	let ariaSort: "ascending" | "descending" | undefined;
	if (criterion !== undefined) {
		ariaSort = criterion.direction === "asc" ? "ascending" : "descending";
	}
	const HeaderIcon = compactHeader?.icon;
	const content = (
		<>
			{HeaderIcon !== undefined && (
				<HeaderIcon
					className={styles.headerIcon}
					aria-hidden
				/>
			)}
			{compactHeader === undefined ? label : compactHeader.text}
		</>
	);

	return (
		<th
			scope="col"
			aria-sort={ariaSort}
			className={joinClassNames(columnAlignments[column], className)}
		>
			<span className={styles.headerContent}>
				{isSortableColumn(column) ? (
					<Tooltip
						content={`${label}\nTrier : croissant, puis décroissant, puis sans tri`}
						placement="bottom"
					>
						<button
							type="button"
							className={joinClassNames(
								styles.sortButton,
								criterion !== undefined && styles.sortedColumn,
							)}
							aria-label={label}
							onClick={() => onToggleSort(column)}
						>
							{content}
							{criterion !== undefined && (
								<span className={styles.sortIndicator}>
									{criterion.direction === "asc" ? (
										<ArrowUp aria-hidden />
									) : (
										<ArrowDown aria-hidden />
									)}
									<span className={styles.sortPriority}>{priority + 1}</span>
								</span>
							)}
						</button>
					</Tooltip>
				) : (
					<Tooltip
						content={compactHeader === undefined ? null : label}
						placement="bottom"
					>
						<span className={styles.staticHeader}>
							{content}
							{compactHeader !== undefined && (
								<span className={styles.visuallyHidden}>{label}</span>
							)}
						</span>
					</Tooltip>
				)}
				{help !== undefined && (
					<Tooltip
						content={help}
						placement="bottom"
						isWide
					>
						<button
							type="button"
							className={styles.helpButton}
							aria-label={`Signification : ${label}`}
						>
							<Info aria-hidden />
						</button>
					</Tooltip>
				)}
			</span>
		</th>
	);
}

/** « faits / total », avec une jauge ; complète, elle passe au vert */
function DlcProgress({
	doneCount,
	totalCount,
}: {
	doneCount: number;
	totalCount: number;
}) {
	return (
		<span
			className={joinClassNames(
				styles.dlcProgress,
				doneCount === totalCount && styles.dlcComplete,
			)}
		>
			<span className={styles.number}>
				{formatDlcProgress(doneCount, totalCount)}
			</span>
			<span
				className={styles.dlcGauge}
				aria-hidden
			>
				<span
					className={styles.dlcGaugeFill}
					style={{ width: `${(doneCount / totalCount) * 100}%` }}
				/>
			</span>
		</span>
	);
}

/**
 * « faits / total » ; un clic ouvre la liste des DLC du jeu, à cocher en mode édition (section 9).
 * En mode édition, elle mène aussi à « Rechercher d'autres DLC », même pour un jeu sans DLC (bouton « + »).
 */
function DlcCell({
	userVersion,
	gameId,
	doneCount,
	totalCount,
	database,
	isEditMode,
	popover,
	handlers,
}: {
	userVersion: UserVersion;
	gameId: number;
	doneCount: number;
	totalCount: number;
	database: Database;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
}) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const isOpen =
		popover?.kind === "dlc" && popover.userVersionId === userVersion.id;
	const dlcs = database.dlcs.filter((dlc) => dlc.gameId === gameId);

	return (
		<span
			className={styles.popoverAnchor}
			data-popover
		>
			<button
				ref={triggerRef}
				type="button"
				className={joinClassNames(
					styles.dlcButton,
					totalCount === 0 && styles.addDlcButton,
				)}
				aria-label={
					totalCount === 0
						? "DLC : en rechercher"
						: `DLC faits : ${formatDlcProgress(doneCount, totalCount)}`
				}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				onClick={() =>
					handlers.setPopover(
						isOpen ? null : { kind: "dlc", userVersionId: userVersion.id },
					)
				}
			>
				{totalCount === 0 ? (
					<Plus aria-hidden />
				) : (
					<DlcProgress
						doneCount={doneCount}
						totalCount={totalCount}
					/>
				)}
			</button>
			{isOpen && (
				<FloatingPanel
					anchorRef={triggerRef}
					role="dialog"
					ariaLabel="DLC faits"
					focusOnOpen={isEditMode ? "first" : "panel"}
					returnsFocus
					className={styles.dlcPopover}
				>
					<div className={styles.popoverHeader}>
						<span className={styles.popoverTitle}>DLC faits</span>
						{totalCount > 0 && (
							<span className={styles.sectionCount}>
								{formatDlcProgress(doneCount, totalCount)}
							</span>
						)}
						{!isEditMode && (
							<span className={styles.readOnlyTag}>
								<Lock aria-hidden />
								Lecture seule
							</span>
						)}
					</div>
					{dlcs.length > 0 && (
						<ul className={styles.dlcList}>
							{dlcs.map((dlc) => {
								const isDone = database.doneDlcs.some(
									(doneDlc) =>
										doneDlc.userVersionId === userVersion.id &&
										doneDlc.dlcId === dlc.id,
								);
								return (
									<li key={dlc.id}>
										{isEditMode ? (
											<Checkbox
												checked={isDone}
												label={dlc.name}
												onChange={() =>
													handlers.toggleDoneDlc(userVersion.id, dlc.id)
												}
											/>
										) : (
											// En lecture seule, la liste se consulte : une coche pour un DLC fait
											<span
												className={joinClassNames(
													styles.readOnlyDlc,
													isDone && styles.doneDlc,
												)}
											>
												<span className={styles.doneMark}>
													{isDone && <Check aria-label="Fait" />}
												</span>
												{dlc.name}
											</span>
										)}
									</li>
								);
							})}
						</ul>
					)}
					{isEditMode && (
						<div className={styles.popoverFooter}>
							<Button
								icon={Search}
								variant="ghost"
								size="sm"
								onClick={() => handlers.openAddDlcs(gameId)}
							>
								Rechercher d’autres DLC
							</Button>
						</div>
					)}
				</FloatingPanel>
			)}
		</span>
	);
}

/** Menu « 3 points verticaux » (section 9) : ouvrir sur IGDB et logger restent disponibles en lecture seule */
function ActionsCell({
	gameId,
	userVersionId,
	igdbUrl,
	hasSeries,
	isEditMode,
	popover,
	handlers,
}: {
	gameId: number;
	userVersionId: number | null;
	igdbUrl: string;
	hasSeries: boolean;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
}) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const isOpen =
		popover?.kind === "actionsMenu" &&
		popover.gameId === gameId &&
		popover.userVersionId === userVersionId;
	// Entrée inactive en lecture seule, avec sa raison en info-bulle
	const editOnlyReason = isEditMode ? null : "Disponible en mode édition";
	// Ligne du jeu, ou à version jouée unique : le menu du jeu ; sous-ligne : le menu de la version jouée
	const items: MenuItem[] =
		userVersionId === null
			? [
					{
						label: "Personnaliser",
						icon: Palette,
						href: null,
						disabledReason: editOnlyReason,
						onSelect: () => handlers.openCustomizeGame(gameId),
					},
					{
						label: "Réorganiser la série",
						icon: ListOrdered,
						href: null,
						disabledReason:
							editOnlyReason ?? (hasSeries ? null : "Ce jeu n’a pas de série"),
						onSelect: () => handlers.openReorderSeries(gameId),
					},
					{
						label: "Modifier le jeu",
						icon: SquarePen,
						href: null,
						disabledReason: editOnlyReason,
						onSelect: () => handlers.openEditGame(gameId),
					},
					{
						label: "Ajouter une version jouée",
						icon: CopyPlus,
						href: null,
						disabledReason: editOnlyReason,
						onSelect: () => handlers.openAddUserVersion(gameId),
					},
					{
						label: "Ouvrir sur IGDB",
						icon: Globe,
						href: igdbUrl,
						disabledReason: null,
						isGroupStart: true,
						onSelect: () => undefined,
					},
					{
						label: "Retirer le jeu du backlog",
						icon: Trash2,
						href: null,
						disabledReason: editOnlyReason,
						isDanger: true,
						isGroupStart: true,
						onSelect: () => handlers.removeGameFromBacklog(gameId),
					},
					{
						label: "Logger cette ligne",
						icon: Terminal,
						href: null,
						disabledReason: null,
						isGroupStart: true,
						onSelect: () => handlers.logRow(gameId, null),
					},
				]
			: [
					{
						label: "Ouvrir la version sur IGDB",
						icon: Globe,
						href: igdbUrl,
						disabledReason: null,
						onSelect: () => undefined,
					},
					{
						label: "Retirer la version jouée",
						icon: Trash2,
						href: null,
						disabledReason: editOnlyReason,
						isDanger: true,
						isGroupStart: true,
						onSelect: () => handlers.removeUserVersion(userVersionId),
					},
					{
						label: "Logger cette ligne",
						icon: Terminal,
						href: null,
						disabledReason: null,
						isGroupStart: true,
						onSelect: () => handlers.logRow(gameId, userVersionId),
					},
				];

	return (
		<span
			className={styles.popoverAnchor}
			data-popover
		>
			<Button
				ref={triggerRef}
				icon={EllipsisVertical}
				variant="ghost"
				size="sm"
				ariaLabel="Actions"
				ariaHaspopup="menu"
				ariaExpanded={isOpen}
				onClick={() =>
					handlers.setPopover(
						isOpen ? null : { kind: "actionsMenu", gameId, userVersionId },
					)
				}
				onKeyDown={(event) => {
					// ↓ ouvre le menu, comme Entrée
					if (event.key === "ArrowDown" && !isOpen) {
						event.preventDefault();
						handlers.setPopover({ kind: "actionsMenu", gameId, userVersionId });
					}
				}}
			/>
			{isOpen && (
				<Menu
					anchorRef={triggerRef}
					items={items}
					ariaLabel="Actions"
					onClose={() => handlers.setPopover(null)}
				/>
			)}
		</span>
	);
}

/** Temps et compteurs : un zéro, valeur par défaut, s'affiche estompé pour laisser ressortir les valeurs saisies (section 7) */
function renderAmount(amount: number, text: string): ReactNode {
	return amount === 0 ? <span className={styles.zeroValue}>{text}</span> : text;
}

/**
 * Colonnes des données de l'utilisateur (section 7). Ligne du jeu à plusieurs versions jouées : agrégats en lecture seule.
 * Sous-ligne ou ligne à version jouée unique : les valeurs de la version jouée, modifiables en mode édition.
 */
function UserVersionDataCell({
	column,
	values,
	userVersion,
	gameId,
	endingType,
	database,
	isEditMode,
	popover,
	handlers,
}: {
	column: ColumnKey;
	values: GameRow | UserVersionRow;
	userVersion: UserVersion | null;
	gameId: number;
	endingType: EndingType;
	database: Database;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
}) {
	const editableUserVersion = isEditMode ? userVersion : null;

	/** Case de la version jouée en mode édition ; sinon, une icône quand la valeur est vraie */
	function renderCheckbox(
		checked: boolean,
		label: string,
		Icon: LucideIcon,
		toggle: (current: UserVersion) => UserVersion,
	) {
		if (editableUserVersion === null) {
			return checked ? (
				<span
					className={joinClassNames(
						styles.booleanMark,
						column === "upNext" && styles.upNextMark,
					)}
					role="img"
					aria-label={label}
				>
					<Icon aria-hidden />
				</span>
			) : null;
		}
		return (
			<Checkbox
				checked={checked}
				ariaLabel={label}
				size="sm"
				className={styles.cellCheckbox}
				onChange={() =>
					handlers.updateUserVersion(editableUserVersion.id, toggle)
				}
			/>
		);
	}

	switch (column) {
		case "status": {
			if (editableUserVersion === null) {
				return values.status === null ? null : (
					<StatusBadge status={values.status} />
				);
			}
			return (
				<Select
					value={editableUserVersion.status}
					// Liste filtrée par type de fin (section 6), le statut actuel compris
					options={statusDefinitions
						.filter(
							({ key }) =>
								key === editableUserVersion.status ||
								isStatusAllowed(key, endingType),
						)
						.map(({ key, label }) => ({
							value: key,
							label,
							content: <StatusBadge status={key} />,
						}))}
					ariaLabel="Statut"
					variant="inline"
					size="sm"
					onChange={(status) =>
						handlers.changeUserVersionStatus(editableUserVersion.id, status)
					}
				/>
			);
		}
		case "upNext":
			return renderCheckbox(
				values.isUpNext,
				"À jouer bientôt",
				Bookmark,
				(current) => ({
					...current,
					isUpNext: !current.isUpNext,
				}),
			);
		case "owned":
			return renderCheckbox(
				values.isOwned,
				"Possédé",
				PackageCheck,
				(current) => ({
					...current,
					isOwned: !current.isOwned,
				}),
			);
		case "finishDate":
			if (editableUserVersion === null) {
				return values.finishDate === null ? null : (
					<span className={styles.number}>
						{formatIsoDate(values.finishDate)}
					</span>
				);
			}
			return (
				<DateField
					value={editableUserVersion.finishDate}
					label="Date de fin"
					variant="inline"
					onCommit={(finishDate) =>
						handlers.updateUserVersion(editableUserVersion.id, (current) => ({
							...current,
							finishDate,
						}))
					}
				/>
			);
		case "finishCount":
			if (editableUserVersion === null) {
				return renderAmount(
					values.sureFinishCount + values.probableFinishCount,
					formatFinishCount(values.sureFinishCount, values.probableFinishCount),
				);
			}
			return (
				<span className={styles.inlinePair}>
					<NumberField
						value={editableUserVersion.sureFinishCount}
						min={0}
						max={null}
						isNullable={false}
						label="Fois fini, sûr"
						variant="inline"
						digits={2}
						onCommit={(count) =>
							handlers.updateUserVersion(editableUserVersion.id, (current) => ({
								...current,
								sureFinishCount: count ?? 0,
							}))
						}
					/>
					<span className={styles.fieldUnit}>+</span>
					<NumberField
						value={editableUserVersion.probableFinishCount}
						min={0}
						max={null}
						isNullable={false}
						label="Fois fini, probable"
						variant="inline"
						digits={2}
						onCommit={(count) =>
							handlers.updateUserVersion(editableUserVersion.id, (current) => ({
								...current,
								probableFinishCount: count ?? 0,
							}))
						}
					/>
					<span className={styles.fieldUnit}>?</span>
				</span>
			);
		case "dlc":
			// La ligne d'un jeu à plusieurs versions jouées affiche « faits / total » en lecture seule
			if (userVersion === null) {
				return values.dlcCount === 0 ? null : (
					<DlcProgress
						doneCount={values.doneDlcCount}
						totalCount={values.dlcCount}
					/>
				);
			}
			// Sans DLC, la cellule reste vide, sauf en mode édition pour en rechercher (section 9)
			if (values.dlcCount === 0 && !isEditMode) {
				return null;
			}
			return (
				<DlcCell
					userVersion={userVersion}
					gameId={gameId}
					doneCount={values.doneDlcCount}
					totalCount={values.dlcCount}
					database={database}
					isEditMode={isEditMode}
					popover={popover}
					handlers={handlers}
				/>
			);
		case "trackedPlayTime":
			if (editableUserVersion === null) {
				return renderAmount(
					values.trackedPlayTimeMinutes,
					formatDuration(values.trackedPlayTimeMinutes),
				);
			}
			return (
				<DurationField
					minutes={editableUserVersion.trackedPlayTimeMinutes}
					label="Temps relevé"
					variant="inline"
					onCommit={(minutes) =>
						handlers.updateUserVersion(editableUserVersion.id, (current) => ({
							...current,
							trackedPlayTimeMinutes: minutes,
						}))
					}
				/>
			);
		case "estimatedPlayTime":
			if (editableUserVersion === null) {
				return renderAmount(
					values.estimatedPlayTimeMinutes,
					formatDuration(values.estimatedPlayTimeMinutes),
				);
			}
			return (
				<DurationField
					minutes={editableUserVersion.estimatedPlayTimeMinutes}
					label="Temps estimé"
					variant="inline"
					onCommit={(minutes) =>
						handlers.updateUserVersion(editableUserVersion.id, (current) => ({
							...current,
							estimatedPlayTimeMinutes: minutes,
						}))
					}
				/>
			);
		case "totalPlayTime":
			return renderAmount(
				values.totalPlayTimeMinutes,
				formatDuration(values.totalPlayTimeMinutes),
			);
		case "rating":
			if (editableUserVersion === null) {
				return values.rating === null ? null : (
					<RatingBadge rating={values.rating} />
				);
			}
			return (
				<span className={styles.inlinePair}>
					<NumberField
						value={editableUserVersion.rating}
						min={0}
						max={20}
						isNullable
						label="Note sur 20"
						variant="inline"
						digits={2}
						placeholder="–"
						onCommit={(rating) =>
							handlers.updateUserVersion(editableUserVersion.id, (current) => ({
								...current,
								rating,
							}))
						}
					/>
					<span className={styles.fieldUnit}>/20</span>
				</span>
			);
		case "comment":
			if (editableUserVersion === null) {
				return values.comment === null ? null : (
					<Tooltip
						content={values.comment}
						isWide
						className={styles.commentTooltip}
					>
						<span className={styles.comment}>{values.comment}</span>
					</Tooltip>
				);
			}
			return (
				<TextField
					value={editableUserVersion.comment}
					label="Commentaire"
					variant="inline"
					placeholder="Ajouter…"
					className={styles.commentField}
					onCommit={(comment) =>
						handlers.updateUserVersion(editableUserVersion.id, (current) => ({
							...current,
							comment,
						}))
					}
				/>
			);
		default:
			return null;
	}
}

/** Ligne du jeu, puis ses sous-lignes de versions jouées si elle est dépliée */
function GameRowGroup({
	row,
	columns,
	cellClassNames,
	isExpanded,
	database,
	isEditMode,
	popover,
	handlers,
}: {
	row: GameRow;
	columns: ColumnKey[];
	/** Alignement et colonnes collantes */
	cellClassNames: Partial<Record<ColumnKey, string>>;
	isExpanded: boolean;
	database: Database;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
}) {
	const isExpandable = row.userVersionRows.length > 1;
	// Ligne à version jouée unique : ses données se modifient directement sur la ligne du jeu
	const singleUserVersion = isExpandable
		? null
		: findById(
				database.userVersions,
				row.userVersionRows.at(0)?.userVersionId ?? null,
			);

	function renderGameCell(column: ColumnKey): ReactNode {
		const renderInfo = gameInfoRenderers[column];
		if (renderInfo !== undefined) {
			return renderInfo(row);
		}
		// Un clic sur la série filtre le tableau sur ses jeux, aussi en lecture seule ; un crayon : ce n'est pas celle d'IGDB
		if (column === "series") {
			const { series, proposedSeries } = row;
			return series === null ? null : (
				<span className={styles.seriesCell}>
					<Tooltip content="Filtrer sur cette série">
						<button
							type="button"
							className={styles.seriesButton}
							onClick={() => handlers.filterOnSeries(series.name)}
						>
							{series.name}
						</button>
					</Tooltip>
					{series.id !== proposedSeries?.id && (
						<Tooltip
							content={`Série modifiée ; IGDB propose : ${proposedSeries?.name ?? "aucune"}`}
						>
							<span
								className={styles.modifiedMark}
								role="img"
								aria-label={`Série modifiée ; IGDB propose : ${proposedSeries?.name ?? "aucune"}`}
							>
								<Pencil aria-hidden />
							</span>
						</Tooltip>
					)}
				</span>
			);
		}
		if (column === "actions") {
			return (
				<ActionsCell
					gameId={row.gameId}
					userVersionId={null}
					igdbUrl={row.igdbUrl}
					hasSeries={row.series !== null}
					isEditMode={isEditMode}
					popover={popover}
					handlers={handlers}
				/>
			);
		}
		return (
			<UserVersionDataCell
				column={column}
				values={row}
				userVersion={singleUserVersion}
				gameId={row.gameId}
				endingType={row.endingType}
				database={database}
				isEditMode={isEditMode}
				popover={popover}
				handlers={handlers}
			/>
		);
	}

	function renderUserVersionCell(
		column: ColumnKey,
		userVersionRow: UserVersionRow,
	): ReactNode {
		const renderInfo = userVersionInfoRenderers[column];
		if (renderInfo !== undefined) {
			return renderInfo(userVersionRow);
		}
		if (column === "actions") {
			return (
				<ActionsCell
					gameId={row.gameId}
					userVersionId={userVersionRow.userVersionId}
					igdbUrl={userVersionRow.igdbUrl}
					hasSeries={row.series !== null}
					isEditMode={isEditMode}
					popover={popover}
					handlers={handlers}
				/>
			);
		}
		return (
			<UserVersionDataCell
				column={column}
				values={userVersionRow}
				userVersion={findById(
					database.userVersions,
					userVersionRow.userVersionId,
				)}
				gameId={row.gameId}
				endingType={row.endingType}
				database={database}
				isEditMode={isEditMode}
				popover={popover}
				handlers={handlers}
			/>
		);
	}

	const userVersionCount = row.userVersionRows.length;

	return (
		<>
			<tr
				className={joinClassNames(
					styles.gameRow,
					row.isUpNext && styles.upNextRow,
					isExpandable && isExpanded && styles.expandedRow,
				)}
			>
				{/* Chevron et badge du nombre de versions jouées sur une ligne dépliable, espace vide sur une ligne simple */}
				<td className={styles.expandCell}>
					{isExpandable && (
						<Tooltip
							content={`${userVersionCount} versions jouées`}
							placement="right"
						>
							<button
								type="button"
								className={styles.expandButton}
								aria-expanded={isExpanded}
								aria-label={`${isExpanded ? "Replier" : "Déplier"} : ${userVersionCount} versions jouées`}
								onClick={() => handlers.toggleExpanded(row.gameId)}
								onKeyDown={(event) => {
									// → déplie, ← replie, comme dans une arborescence
									if (
										(event.key === "ArrowRight" && !isExpanded) ||
										(event.key === "ArrowLeft" && isExpanded)
									) {
										event.preventDefault();
										handlers.toggleExpanded(row.gameId);
									}
								}}
							>
								<ChevronRight
									className={styles.chevron}
									aria-hidden
								/>
								<span className={styles.versionCount}>{userVersionCount}</span>
							</button>
						</Tooltip>
					)}
				</td>
				{columns.map((column) => (
					<td
						key={column}
						className={cellClassNames[column]}
					>
						{renderGameCell(column)}
					</td>
				))}
			</tr>
			{isExpandable &&
				isExpanded &&
				row.userVersionRows.map((userVersionRow, index) => (
					<tr
						key={userVersionRow.userVersionId}
						className={joinClassNames(
							styles.userVersionRow,
							index === userVersionCount - 1 && styles.lastUserVersionRow,
						)}
					>
						<td className={styles.expandCell} />
						{columns.map((column) => (
							<td
								key={column}
								className={cellClassNames[column]}
							>
								{renderUserVersionCell(column, userVersionRow)}
							</td>
						))}
					</tr>
				))}
		</>
	);
}

/** Résumé d'un intervalle de filtre : « ≥ 10 », « ≤ 20 », « 10 – 20 » ; `null` sans borne */
function formatRangeSummary(
	min: string | null,
	max: string | null,
): string | null {
	if (min !== null && max !== null) {
		return `${min} – ${max}`;
	}
	if (min !== null) {
		return `≥ ${min}`;
	}
	return max === null ? null : `≤ ${max}`;
}

/**
 * Filtre d'un intervalle (nombres, temps, dates) : un bouton aussi étroit que la colonne résume les bornes,
 * les deux champs s'ouvrent dans un popover. Échap ou Entrée le referment.
 */
function RangeFilter({
	label,
	summary,
	children,
}: {
	label: string;
	/** `null` sans filtre */
	summary: string | null;
	children: ReactNode;
}) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Tooltip content={summary === null ? null : `${label} : ${summary}`}>
				<button
					ref={triggerRef}
					type="button"
					className={joinClassNames(
						styles.filterTrigger,
						summary !== null && styles.activeFilter,
					)}
					aria-label={summary === null ? label : `${label} : ${summary}`}
					aria-haspopup="dialog"
					aria-expanded={isOpen}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className={styles.filterSummary}>{summary ?? "Tous"}</span>
					<ChevronDown aria-hidden />
				</button>
			</Tooltip>
			{isOpen && (
				<FloatingPanel
					anchorRef={triggerRef}
					role="dialog"
					ariaLabel={label}
					focusOnOpen="first"
					returnsFocus
					className={styles.rangePopover}
					onClickOutside={() => setIsOpen(false)}
					onKeyDown={(event) => {
						// Entrée dans un champ de borne valide et referme ; pas sur un jour du calendrier
						if (
							event.key === "Escape" ||
							(event.key === "Enter" &&
								event.target instanceof HTMLInputElement)
						) {
							event.stopPropagation();
							setIsOpen(false);
						}
					}}
				>
					<p className={styles.popoverTitle}>{label}</p>
					<div className={styles.rangeFields}>{children}</div>
				</FloatingPanel>
			)}
		</>
	);
}

/** Minimum et maximum d'un nombre ; les temps se saisissent en heures et se filtrent en minutes */
function NumberRangeFilter({
	column,
	filter,
	label,
	onChange,
}: {
	column: ColumnKey;
	filter: Extract<ColumnFilter, { kind: "numberRange" }> | null;
	label: string;
	onChange: (filter: ColumnFilter | null) => void;
}) {
	const unit = isDurationColumn(column) ? 60 : 1;
	const minBound = filter?.min ?? null;
	const maxBound = filter?.max ?? null;
	const minRef = useRef<HTMLInputElement>(null);
	const maxRef = useRef<HTMLInputElement>(null);
	const unitLabel = unit === 60 ? " h" : "";

	function readBound(input: HTMLInputElement | null): number | null {
		if (input === null || input.value === "" || !input.validity.valid) {
			return null;
		}
		return Number(input.value) * unit;
	}

	function update() {
		const min = readBound(minRef.current);
		const max = readBound(maxRef.current);
		onChange(
			min === null && max === null
				? null
				: { column, kind: "numberRange", min, max },
		);
	}

	return (
		<RangeFilter
			label={label}
			summary={formatRangeSummary(
				minBound === null ? null : `${minBound / unit}${unitLabel}`,
				maxBound === null ? null : `${maxBound / unit}${unitLabel}`,
			)}
		>
			<label className={styles.rangeField}>
				<span className={styles.formLabel}>Minimum</span>
				<span className={styles.rangeInputGroup}>
					<input
						ref={minRef}
						type="number"
						step="any"
						className={styles.rangeInput}
						placeholder="min"
						aria-label={`${label}, minimum`}
						defaultValue={minBound === null ? "" : minBound / unit}
						onChange={update}
					/>
					{unit === 60 && <span className={styles.fieldUnit}>h</span>}
				</span>
			</label>
			<span
				className={styles.rangeDash}
				aria-hidden
			>
				–
			</span>
			<label className={styles.rangeField}>
				<span className={styles.formLabel}>Maximum</span>
				<span className={styles.rangeInputGroup}>
					<input
						ref={maxRef}
						type="number"
						step="any"
						className={styles.rangeInput}
						placeholder="max"
						aria-label={`${label}, maximum`}
						defaultValue={maxBound === null ? "" : maxBound / unit}
						onChange={update}
					/>
					{unit === 60 && <span className={styles.fieldUnit}>h</span>}
				</span>
			</label>
		</RangeFilter>
	);
}

/** Dates de début et de fin, incluses */
function DateRangeFilter({
	column,
	filter,
	label,
	onChange,
}: {
	column: ColumnKey;
	filter: Extract<ColumnFilter, { kind: "dateRange" }> | null;
	label: string;
	onChange: (filter: ColumnFilter | null) => void;
}) {
	const from = filter?.from ?? null;
	const to = filter?.to ?? null;

	function update(nextFrom: IsoDate | null, nextTo: IsoDate | null) {
		onChange(
			nextFrom === null && nextTo === null
				? null
				: { column, kind: "dateRange", from: nextFrom, to: nextTo },
		);
	}

	return (
		<RangeFilter
			label={label}
			summary={formatRangeSummary(
				from === null ? null : formatIsoDate(from),
				to === null ? null : formatIsoDate(to),
			)}
		>
			<FormField label="Depuis">
				<DateField
					value={from}
					commitOn="change"
					label={`${label}, depuis`}
					onCommit={(nextFrom) => update(nextFrom, to)}
				/>
			</FormField>
			<span
				className={styles.rangeDash}
				aria-hidden
			>
				–
			</span>
			<FormField label="Jusqu’à">
				<DateField
					value={to}
					commitOn="change"
					label={`${label}, jusqu’à`}
					onCommit={(nextTo) => update(from, nextTo)}
				/>
			</FormField>
		</RangeFilter>
	);
}

/** Filtre d'une colonne, dans la ligne sous les en-têtes (section 9) */
function ColumnFilterCell({
	column,
	filter,
	database,
	onChange,
}: {
	column: ColumnKey;
	filter: ColumnFilter | null;
	database: Database;
	onChange: (filter: ColumnFilter | null) => void;
}) {
	const label = `Filtre ${getColumnLabel(column)}`;

	switch (columnFilterKinds[column]) {
		case "text": {
			const textFilter = filter?.kind === "text" ? filter : null;
			return (
				<span
					className={joinClassNames(
						styles.textFilter,
						textFilter !== null && styles.activeFilter,
					)}
				>
					{textFilter?.isExact === true && (
						<Tooltip content="Valeur exacte, après un clic sur une série">
							<span className={styles.exactMark}>=</span>
						</Tooltip>
					)}
					<input
						type="search"
						// Sans largeur propre : le champ prend celle de sa colonne, sans l'élargir
						size={1}
						className={styles.filterInput}
						placeholder="Contient…"
						aria-label={label}
						value={textFilter?.text ?? ""}
						onChange={(event) =>
							onChange(
								event.target.value === ""
									? null
									: {
											column,
											kind: "text",
											text: event.target.value,
											isExact: false,
										},
							)
						}
					/>
				</span>
			);
		}
		case "value":
			return (
				<Select
					value={filter?.kind === "value" ? filter.value : ""}
					options={[
						{ value: "", label: "Tous" },
						...getFilterOptions(column, database).map((option) => {
							let content: ReactNode = option.label;
							if (column === "status") {
								content = <StatusBadge status={option.value as Status} />;
							} else if (column === "endingType") {
								content = (
									<EndingTypeLabel endingType={option.value as EndingType} />
								);
							}
							return { ...option, content };
						}),
					]}
					ariaLabel={label}
					size="sm"
					isHighlighted={filter?.kind === "value"}
					className={styles.filterSelect}
					onChange={(value) =>
						onChange(value === "" ? null : { column, kind: "value", value })
					}
				/>
			);
		case "boolean": {
			let selectedValue = "";
			if (filter?.kind === "boolean") {
				selectedValue = filter.value ? "oui" : "non";
			}
			// Colonne étroite : le champ ne montre qu'une icône, la liste les libellés
			return (
				<Select
					value={selectedValue}
					options={[
						{
							value: "",
							label: "Tous",
							triggerContent: (
								<Minus
									className={styles.filterAllMark}
									aria-hidden
								/>
							),
						},
						{
							value: "oui",
							label: "Oui",
							triggerContent: <Check aria-hidden />,
						},
						{ value: "non", label: "Non", triggerContent: <X aria-hidden /> },
					]}
					ariaLabel={label}
					size="sm"
					isCompact
					isHighlighted={filter?.kind === "boolean"}
					className={styles.filterSelect}
					onChange={(value) =>
						onChange(
							value === ""
								? null
								: { column, kind: "boolean", value: value === "oui" },
						)
					}
				/>
			);
		}
		case "numberRange":
			return (
				<NumberRangeFilter
					column={column}
					filter={filter?.kind === "numberRange" ? filter : null}
					label={label}
					onChange={onChange}
				/>
			);
		case "dateRange":
			return (
				<DateRangeFilter
					column={column}
					filter={filter?.kind === "dateRange" ? filter : null}
					label={label}
					onChange={onChange}
				/>
			);
		default:
			return null;
	}
}

function BacklogTable({
	rows,
	columns,
	sort,
	filters,
	expandedGameIds,
	loadedPageCount,
	database,
	isEditMode,
	popover,
	handlers,
	onToggleSort,
	onFilterChange,
	onClearFilters,
	onLoadNextPage,
	onFocusSearch,
}: {
	rows: GameRow[];
	columns: ColumnSetting[];
	sort: SortCriterion[];
	filters: ColumnFilter[];
	expandedGameIds: number[];
	loadedPageCount: number;
	database: Database;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
	onToggleSort: (column: ColumnKey) => void;
	onFilterChange: (column: ColumnKey, filter: ColumnFilter | null) => void;
	onClearFilters: () => void;
	onLoadNextPage: () => void;
	/** Le backlog vide propose d'aller à la recherche */
	onFocusSearch: () => void;
}) {
	const visibleColumns = columns
		.filter(({ isVisible }) => isVisible)
		.map(({ key }) => key);
	// Classes de chaque colonne : son alignement, et sa place si elle colle au défilement horizontal
	const stickyClassNames = getStickyColumnClassNames(visibleColumns);
	const cellClassNames: Partial<Record<ColumnKey, string>> = {};
	for (const column of visibleColumns) {
		cellClassNames[column] = joinClassNames(
			columnAlignments[column],
			stickyClassNames[column],
			column === "thumbnail" && styles.thumbnailCell,
		);
	}
	const shownRows = rows.slice(0, loadedPageCount * backlogPageSize);
	const hasMoreRows = shownRows.length < rows.length;
	const loadMoreRef = useRef<HTMLDivElement>(null);
	// Les bornes des nombres et des dates sont des champs libres : effacer les filtres recrée la ligne pour les vider
	const [filterRowKey, setFilterRowKey] = useState(0);

	function clearFilters() {
		setFilterRowKey((key) => key + 1);
		onClearFilters();
	}

	// Défilement infini : la page suivante se charge à l'approche du bas de page, avant de l'atteindre
	useEffect(() => {
		const loadMore = loadMoreRef.current;
		if (!hasMoreRows || loadMore === null) {
			return undefined;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some(({ isIntersecting }) => isIntersecting)) {
					onLoadNextPage();
				}
			},
			{ rootMargin: "0px 0px 800px 0px" },
		);
		observer.observe(loadMore);
		return () => observer.disconnect();
	}, [hasMoreRows, loadedPageCount, onLoadNextPage]);

	const gameCount = database.userGames.length;
	const userVersionCount = database.userVersions.length;

	return (
		<div className={styles.tableArea}>
			{/* Résumé du backlog, calé à gauche même quand la page défile en largeur */}
			<div className={styles.tableCaption}>
				<span className={styles.captionCount}>
					{filters.length > 0 ? (
						<>
							<strong>{rows.length}</strong> {rows.length > 1 ? "jeux" : "jeu"}{" "}
							sur {gameCount}
						</>
					) : (
						<>
							<strong>{gameCount}</strong> {gameCount > 1 ? "jeux" : "jeu"}
							<span className={styles.captionSeparator}>·</span>
							<strong>{userVersionCount}</strong>{" "}
							{userVersionCount > 1 ? "versions jouées" : "version jouée"}
						</>
					)}
				</span>
				{filters.length > 0 && (
					<span className={styles.captionFilters}>
						<ListFilter aria-hidden />
						{filters.length > 1
							? `${filters.length} filtres actifs`
							: "1 filtre actif"}
					</span>
				)}
				{isEditMode && (
					<span className={styles.editModeTag}>
						<PencilLine aria-hidden />
						Mode édition
						<span className={styles.editModeHint}>
							retour en lecture seule après 1 min sans activité
						</span>
					</span>
				)}
			</div>
			<table
				className={joinClassNames(
					styles.table,
					isEditMode && styles.editingTable,
				)}
				aria-label="Backlog"
				data-backlog-table
			>
				<thead>
					<tr className={styles.headerRow}>
						<th
							className={styles.expandCell}
							aria-label="Versions jouées"
						/>
						{visibleColumns.map((column) => (
							<ColumnHeader
								key={column}
								column={column}
								sort={sort}
								className={stickyClassNames[column]}
								onToggleSort={onToggleSort}
							/>
						))}
					</tr>
					<tr
						key={filterRowKey}
						className={styles.filterRow}
					>
						{/* Un filtre actif fait place au bouton qui les retire tous (section 9) */}
						<th
							className={styles.expandCell}
							aria-label="Filtres"
						>
							{filters.length === 0 ? (
								<ListFilter
									className={styles.filterRowIcon}
									aria-hidden
								/>
							) : (
								<Button
									icon={FunnelX}
									variant="ghost"
									size="sm"
									ariaLabel="Effacer tous les filtres"
									tooltip="Effacer tous les filtres"
									tooltipPlacement="right"
									className={styles.clearFiltersButton}
									onClick={clearFilters}
								/>
							)}
						</th>
						{visibleColumns.map((column) => (
							<th
								key={column}
								className={cellClassNames[column]}
							>
								<ColumnFilterCell
									column={column}
									filter={
										filters.find((filter) => filter.column === column) ?? null
									}
									database={database}
									onChange={(filter) => onFilterChange(column, filter)}
								/>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{shownRows.map((row) => (
						<GameRowGroup
							key={row.gameId}
							row={row}
							columns={visibleColumns}
							cellClassNames={cellClassNames}
							isExpanded={expandedGameIds.includes(row.gameId)}
							database={database}
							isEditMode={isEditMode}
							popover={popover}
							handlers={handlers}
						/>
					))}
				</tbody>
			</table>
			{rows.length === 0 && (
				<div className={styles.emptyState}>
					<span className={styles.emptyIcon}>
						{filters.length > 0 ? (
							<SearchX aria-hidden />
						) : (
							<Gamepad2 aria-hidden />
						)}
					</span>
					{filters.length > 0 ? (
						<>
							<p className={styles.emptyTitle}>
								Aucun jeu ne correspond aux filtres.
							</p>
							<Button
								icon={FunnelX}
								onClick={clearFilters}
							>
								Effacer les filtres
							</Button>
						</>
					) : (
						<>
							<p className={styles.emptyTitle}>Le backlog est vide</p>
							<p className={styles.emptyText}>
								Ajoute un jeu depuis la recherche, avec une plateforme.
							</p>
							<Button
								icon={Search}
								variant="primary"
								onClick={onFocusSearch}
							>
								Rechercher un jeu
							</Button>
						</>
					)}
				</div>
			)}
			{hasMoreRows && (
				<div
					ref={loadMoreRef}
					className={styles.loadMore}
				>
					<Spinner />
					Chargement…
				</div>
			)}
		</div>
	);
}

/** Visibilité et ordre des colonnes (section 9) : appliqués tout de suite, gardés dans le navigateur */
function ColumnsModal({
	columns,
	onToggleVisibility,
	onMove,
	onClose,
}: {
	columns: ColumnSetting[];
	onToggleVisibility: (key: ColumnKey) => void;
	onMove: (key: ColumnKey, offset: -1 | 1) => void;
	onClose: () => void;
}) {
	const visibleCount = columns.filter(({ isVisible }) => isVisible).length;

	/** Déplacée en premier ou en dernier, une colonne perd un de ses boutons : le focus passe à l'autre */
	function move(
		key: ColumnKey,
		offset: -1 | 1,
		button: HTMLButtonElement,
		isReachingEnd: boolean,
	) {
		onMove(key, offset);
		if (isReachingEnd) {
			const row = button.closest("li");
			window.requestAnimationFrame(() =>
				row
					?.querySelector<HTMLButtonElement>(
						`[data-move="${offset === -1 ? "down" : "up"}"]`,
					)
					?.focus(),
			);
		}
	}

	return (
		<ModalDialog
			title="Colonnes"
			subtitle={`${visibleCount} sur ${columns.length} affichées`}
			icon={Columns3}
			size="sm"
			actions={
				<Button
					variant="primary"
					onClick={onClose}
				>
					Fermer
				</Button>
			}
			onClose={onClose}
		>
			<p className={styles.modalIntro}>
				Masquer une colonne la retire aussi du tri et des filtres. L’ordre et la
				visibilité sont gardés dans ce navigateur.
			</p>
			<ol className={styles.columnList}>
				{columns.map(({ key, isVisible }, index) => {
					const label = getColumnLabel(key);
					return (
						<li
							key={key}
							className={joinClassNames(
								styles.columnItem,
								!isVisible && styles.hiddenColumn,
							)}
						>
							<Checkbox
								variant="switch"
								checked={isVisible}
								disabled={key === "actions"}
								label={label}
								tooltip={
									key === "actions"
										? "Toujours visible : sans elle, plus de menu"
										: null
								}
								onChange={() => onToggleVisibility(key)}
							/>
							<span className={styles.columnMoves}>
								<button
									type="button"
									className={styles.moveButton}
									data-move="up"
									aria-label={`Monter ${label}`}
									disabled={index === 0}
									onClick={(event) =>
										move(key, -1, event.currentTarget, index === 1)
									}
								>
									<ChevronUp aria-hidden />
								</button>
								<button
									type="button"
									className={styles.moveButton}
									data-move="down"
									aria-label={`Descendre ${label}`}
									disabled={index === columns.length - 1}
									onClick={(event) =>
										move(
											key,
											1,
											event.currentTarget,
											index === columns.length - 2,
										)
									}
								>
									<ChevronDown aria-hidden />
								</button>
							</span>
						</li>
					);
				})}
			</ol>
		</ModalDialog>
	);
}

// ---------- Footer de debug ----------

const copyLabels = {
	idle: { label: "Copier l’état", icon: Copy },
	copied: { label: "État copié", icon: ClipboardCheck },
	failed: { label: "Copie impossible", icon: ClipboardX },
};

function DebugFooter({
	state,
	undoHistoryLength,
	redoHistoryLength,
}: {
	state: AppState;
	undoHistoryLength: number;
	redoHistoryLength: number;
}) {
	const { database } = state;
	const lastAddedGame = getLastAddedGame(database);
	const [copyStatus, setCopyStatus] = useState<keyof typeof copyLabels>("idle");

	function showCopyStatus(status: keyof typeof copyLabels) {
		setCopyStatus(status);
		window.setTimeout(() => setCopyStatus("idle"), 2000);
	}

	function copyState() {
		navigator.clipboard
			.writeText(buildInitialStateFile(state))
			.then(() => showCopyStatus("copied"))
			.catch((error: unknown) => {
				console.error("Copie de l’état impossible :", error);
				showCopyStatus("failed");
			});
	}

	return (
		<footer className={styles.debugFooter}>
			<div className={styles.debugItems}>
				<span className={styles.debugTitle}>
					<Bug aria-hidden />
					Debug
				</span>
				<span>
					Dernier jeu ajouté :{" "}
					<strong>
						{lastAddedGame
							? (lastAddedGame.frenchName ?? lastAddedGame.name)
							: "aucun"}
					</strong>
				</span>
				<span>
					En base — jeux : <strong>{database.games.length}</strong> · versions :{" "}
					<strong>{database.versions.length}</strong> · DLC :{" "}
					<strong>{database.dlcs.length}</strong>
				</span>
				<span>
					Backlog — jeux : <strong>{database.userGames.length}</strong> ·
					versions jouées : <strong>{database.userVersions.length}</strong>
				</span>
				<span>
					Historique d’annulation : <strong>{undoHistoryLength}</strong> · à
					rétablir : <strong>{redoHistoryLength}</strong>
				</span>
				<span className={styles.debugSort}>
					Tri :{" "}
					{state.sort.length === 0
						? "aucun"
						: state.sort.map(({ column, direction }, index) => (
								<span key={column}>
									{index > 0 && ", "}
									{getColumnLabel(column)}
									{direction === "asc" ? (
										<ArrowUp aria-label="croissant" />
									) : (
										<ArrowDown aria-label="décroissant" />
									)}
								</span>
							))}
				</span>
				<span>Filtres : {describeFilters(state.filters)}</span>
			</div>
			<Button
				icon={copyLabels[copyStatus].icon}
				size="sm"
				className={styles.copyButton}
				onClick={copyState}
			>
				{copyLabels[copyStatus].label}
			</Button>
		</footer>
	);
}

// ---------- Page ----------

/** Toute action de l'utilisateur relance le minuteur d'inactivité du mode édition */
const activityEvents = [
	"pointerdown",
	"pointermove",
	"keydown",
	"wheel",
	"scroll",
	"touchstart",
] as const;

/** Champ où l'on tape : Ctrl+Z y reste l'annulation du navigateur */
function isTextField(
	target: EventTarget | null,
): target is HTMLInputElement | HTMLTextAreaElement {
	return (
		target instanceof HTMLTextAreaElement ||
		(target instanceof HTMLInputElement &&
			["text", "number", "date", "search"].includes(target.type))
	);
}

/** Une cellule est en cours d'édition quand le focus est dans un de ses champs de saisie */
function isEditingCell(): boolean {
	const element = document.activeElement;
	return (
		isTextField(element) &&
		element.closest("[data-backlog-table] tbody") !== null
	);
}

export function Backlog() {
	// Un useState par clé de initialState
	const [database, setDatabase] = useState<AppState["database"]>(
		initialState.database,
	);
	const [searchQuery, setSearchQuery] = useState<AppState["searchQuery"]>(
		initialState.searchQuery,
	);
	const [searchResults, setSearchResults] = useState<AppState["searchResults"]>(
		initialState.searchResults,
	);
	const [isSearchOpen, setIsSearchOpen] = useState<AppState["isSearchOpen"]>(
		initialState.isSearchOpen,
	);
	const [modal, setModal] = useState<AppState["modal"]>(initialState.modal);
	const [popover, setPopover] = useState<AppState["popover"]>(
		initialState.popover,
	);
	const [isEditMode, setIsEditMode] = useState<AppState["isEditMode"]>(
		initialState.isEditMode,
	);
	const [expandedGameIds, setExpandedGameIds] = useState<
		AppState["expandedGameIds"]
	>(initialState.expandedGameIds);
	// La disposition sauvegardée dans le navigateur, puis le tri et les filtres de l'URL, priment sur initialState (section 4).
	// Une URL qui trie ou filtre sur une colonne masquée voit ce critère ignoré (section 9).
	const [columns, setColumns] = useState<AppState["columns"]>(
		() => loadSavedColumns() ?? initialState.columns,
	);
	const [sort, setSort] = useState<AppState["sort"]>(() =>
		keepVisibleColumns(
			readViewFromUrl(window.location.search)?.sort ?? initialState.sort,
			columns,
		),
	);
	const [filters, setFilters] = useState<AppState["filters"]>(() =>
		keepVisibleColumns(
			readViewFromUrl(window.location.search)?.filters ?? initialState.filters,
			columns,
		),
	);
	const [loadedPageCount, setLoadedPageCount] = useState<
		AppState["loadedPageCount"]
	>(initialState.loadedPageCount);

	// États passagers, hors AppState : historique d'annulation (en mémoire seulement), recherche et modale en cours
	const [undoHistory, setUndoHistory] = useState<Database[]>([]);
	const [redoHistory, setRedoHistory] = useState<Database[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [modalError, setModalError] = useState<string | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Seule fonction qui modifie la base : chaque appel est une action, annulable avec Ctrl+Z (section 10)
	function changeDatabase(change: (current: Database) => Database) {
		const next = change(database);
		// Rien n'a changé (ex. version jouée déjà présente) : pas d'action
		if (next === database) {
			return;
		}
		setUndoHistory(pushToHistory(undoHistory, database));
		// Une nouvelle action efface ce qui restait à rétablir
		setRedoHistory([]);
		setDatabase(next);
	}

	function undo() {
		const previous = undoHistory.at(-1);
		if (previous === undefined) {
			return;
		}
		setUndoHistory(undoHistory.slice(0, -1));
		setRedoHistory([...redoHistory, database]);
		setDatabase(previous);
	}

	function redo() {
		const next = redoHistory.at(-1);
		if (next === undefined) {
			return;
		}
		setRedoHistory(redoHistory.slice(0, -1));
		setUndoHistory(pushToHistory(undoHistory, database));
		setDatabase(next);
	}

	function changeSearchQuery(query: string) {
		setSearchQuery(query);
		setIsSearchOpen(true);
		if (query.trim() === "") {
			setSearchResults([]);
			setIsSearching(false);
			setSearchError(null);
		}
	}

	/**
	 * Un résultat déjà en base, ou un jeu de « Ma base », mène à l'ajout au backlog, sa version originale pré-sélectionnée
	 * (un résultat est toujours un jeu original, section 8) ; sinon à la modale d'ajout.
	 */
	function selectSearchResult(result: SearchResult) {
		setIsSearchOpen(false);
		setModalError(null);
		setModal(getGameModal(database, result.id, []));
	}

	/** Passe à la modale suivante : le prochain DLC de la file à ajouter comme jeu (section 8), sinon ferme */
	function openNextQueuedModal(queuedGameIds: number[]) {
		setModalError(null);
		setModal(getNextQueuedModal(database, queuedGameIds));
	}

	/** « Annuler » aussi passe au DLC suivant de la file */
	function closeModal() {
		openNextQueuedModal(getQueuedGameIds(modal));
	}

	/**
	 * Enregistre le jeu ; avec « Ajouter à mon backlog », ouvre ensuite l'ajout au backlog, action distincte (section 8),
	 * avec les images déjà lues sur IGDB. La version originale y est pré-sélectionnée si c'est la seule cochée.
	 * Les DLC cochés « comme jeu » suivent, dans l'ordre.
	 */
	function validateAddGame(addGameModal: Extract<Modal, { kind: "addGame" }>) {
		const { gameImport, selection, isAddingToBacklog } = addGameModal;
		if (gameImport === null) {
			return;
		}
		const queuedGameIds = [
			...getDlcAsGameQueue(gameImport.dlcs, selection),
			...addGameModal.queuedGameIds,
		];
		const nextDatabase = addGameImport(
			database,
			keepSelection(gameImport, selection),
		);
		changeDatabase(() => nextDatabase);
		if (!isAddingToBacklog) {
			openNextQueuedModal(queuedGameIds);
			return;
		}
		setModalError(null);
		setModal(
			getAddUserVersionModal(
				nextDatabase,
				gameImport.game.id,
				selection.versionIds.length === 1 ? gameImport.game.id : null,
				gameImport.imageIds,
				queuedGameIds,
			),
		);
	}

	/**
	 * La personnalisation si le jeu entre dans le backlog, puis la version jouée, en une seule action.
	 * Comme un changement de statut dans le tableau : au rang 5 ou plus sans date de fin, la petite fenêtre la propose (section 6).
	 */
	function validateAddUserVersion(
		addUserVersionModal: Extract<Modal, { kind: "addUserVersion" }>,
	) {
		const { gameId, draft, userGameDraft, queuedGameIds } = addUserVersionModal;
		const { versionId, platformId } = draft;
		if (versionId === null || platformId === null) {
			return;
		}
		const userVersionId = getNextUserVersionId(database);
		changeDatabase((current) =>
			addUserVersion(
				userGameDraft === null
					? current
					: saveUserGame(current, gameId, userGameDraft),
				versionId,
				platformId,
				draft,
			),
		);
		setModalError(null);
		if (isFinishedStatus(draft.status) && draft.finishDate === null) {
			setModal({
				kind: "setFinishDate",
				userVersionId,
				finishDate: getTodayIsoDate(),
				queuedGameIds,
			});
		} else {
			openNextQueuedModal(queuedGameIds);
		}
	}

	/**
	 * Les versions et DLC cochés en plus, en une seule action ; les DLC cochés « comme jeu » suivent.
	 * Avec seulement des DLC « comme jeu » cochés, la base ne change pas : pas d'action vide.
	 */
	function validateEditGame(
		editGameModal: Extract<Modal, { kind: "editGame" }>,
	) {
		const { gameImport, selection } = editGameModal;
		if (gameImport !== null && hasGameEditChanges(database, editGameModal)) {
			changeDatabase((current) =>
				addGameImport(current, keepSelection(gameImport, selection)),
			);
		}
		openNextQueuedModal(
			gameImport === null ? [] : getDlcAsGameQueue(gameImport.dlcs, selection),
		);
	}

	/** La personnalisation, puis la conversion des statuts que le nouveau type de fin rend incompatibles, en une seule action */
	function validateCustomizeGame(
		customizeGameModal: Extract<Modal, { kind: "customizeGame" }>,
	) {
		const { gameId, draft } = customizeGameModal;
		changeDatabase((current) => saveUserGame(current, gameId, draft));
		closeModal();
	}

	/** Les nouveaux numéros de la série, en une seule action */
	function validateReorderSeries(
		reorderSeriesModal: Extract<Modal, { kind: "reorderSeries" }>,
	) {
		const { entries } = reorderSeriesModal;
		changeDatabase((current) => saveSeriesNumbers(current, entries));
		closeModal();
	}

	function validateAddDlcs(addDlcsModal: Extract<Modal, { kind: "addDlcs" }>) {
		const { dlcs, dlcIds } = addDlcsModal;
		changeDatabase((current) =>
			addDlcs(
				current,
				(dlcs ?? []).filter(({ id }) => dlcIds.includes(id)),
			),
		);
		closeModal();
	}

	function validateFinishDate(
		finishDateModal: Extract<Modal, { kind: "setFinishDate" }>,
	) {
		const { userVersionId, finishDate } = finishDateModal;
		changeDatabase((current) =>
			updateUserVersion(current, userVersionId, (userVersion) => ({
				...userVersion,
				finishDate,
			})),
		);
		closeModal();
	}

	function toggleExpanded(gameId: number) {
		setExpandedGameIds((current) =>
			current.includes(gameId)
				? current.filter((id) => id !== gameId)
				: [...current, gameId],
		);
	}

	/** Au rang 5 ou plus sans date de fin, une petite fenêtre la propose, pré-remplie avec la date du jour (section 6) */
	function changeUserVersionStatus(userVersionId: number, status: Status) {
		const userVersion = findById(database.userVersions, userVersionId);
		changeDatabase((current) =>
			setUserVersionStatus(current, userVersionId, status),
		);
		if (
			userVersion !== null &&
			isFinishedStatus(status) &&
			userVersion.finishDate === null
		) {
			setModal({
				kind: "setFinishDate",
				userVersionId,
				finishDate: getTodayIsoDate(),
				queuedGameIds: [],
			});
		}
	}

	function openCustomizeGame(gameId: number) {
		const game = findById(database.games, gameId);
		const userGame = findUserGame(database, gameId);
		if (game === null || userGame === null) {
			return;
		}
		setModalError(null);
		setModal({
			kind: "customizeGame",
			gameId,
			draft: getUserGameDraft(game, userGame),
			imageIds: null,
		});
	}

	function openReorderSeries(gameId: number) {
		const reorderSeriesModal = getReorderSeriesModal(database, gameId);
		if (reorderSeriesModal !== null) {
			setModalError(null);
			setModal(reorderSeriesModal);
		}
	}

	function logRow(gameId: number, userVersionId: number | null) {
		const rowData = getRowData(database, gameId, userVersionId);
		// eslint-disable-next-line no-console -- « Logger cette ligne » (section 9)
		console.log(`🪵 ${rowData.game?.name ?? `Jeu ${gameId}`}`, rowData);
	}

	const tableHandlers: TableHandlers = {
		toggleExpanded,
		setPopover,
		updateUserVersion: (userVersionId, update) =>
			changeDatabase((current) =>
				updateUserVersion(current, userVersionId, update),
			),
		changeUserVersionStatus,
		toggleDoneDlc: (userVersionId, dlcId) =>
			changeDatabase((current) => toggleDoneDlc(current, userVersionId, dlcId)),
		openCustomizeGame,
		openReorderSeries,
		openEditGame: (gameId) => {
			setModalError(null);
			setModal({
				kind: "editGame",
				gameId,
				gameImport: null,
				selection: emptyImportSelection,
			});
		},
		openAddUserVersion: (gameId) => {
			setModalError(null);
			setModal(getAddUserVersionModal(database, gameId, null, null, []));
		},
		openAddDlcs: (gameId) => {
			setPopover(null);
			setModalError(null);
			setModal({ kind: "addDlcs", gameId, dlcs: null, dlcIds: [] });
		},
		removeGameFromBacklog: (gameId) =>
			changeDatabase((current) =>
				removeUserVersions(current, getGameUserVersionIds(current, gameId)),
			),
		removeUserVersion: (userVersionId) =>
			changeDatabase((current) => removeUserVersions(current, [userVersionId])),
		logRow,
		filterOnSeries: (seriesName) =>
			setFilters(
				setColumnFilter(filters, "series", {
					column: "series",
					kind: "text",
					text: seriesName,
					isExact: true,
				}),
			),
	};

	/** Une colonne masquée sort du tri et des filtres (section 9) */
	function changeColumnVisibility(key: ColumnKey) {
		const nextColumns = toggleColumnVisibility(columns, key);
		setColumns(nextColumns);
		setSort(keepVisibleColumns(sort, nextColumns));
		setFilters(keepVisibleColumns(filters, nextColumns));
	}

	// La disposition des colonnes se garde dans le navigateur (section 9)
	useEffect(() => {
		saveColumns(columns);
	}, [columns]);

	// Le thème du backlog (clair ou sombre selon le système) habille toute la page, panneaux en portail compris
	useEffect(() => {
		const root = document.documentElement;
		root.classList.add(styles.themeRoot);
		return () => root.classList.remove(styles.themeRoot);
	}, []);

	// Le tri et les filtres se gardent dans l'URL (section 9), sans toucher à l'état du routeur
	useEffect(() => {
		const routerState: unknown = window.history.state;
		window.history.replaceState(
			routerState,
			"",
			`${window.location.pathname}?${buildViewSearch(sort, filters)}${window.location.hash}`,
		);
	}, [sort, filters]);

	// Lignes recalculées seulement quand la base, les filtres ou le tri changent : pas à chaque frappe, popover ou modale
	const rows = useMemo(
		() => sortGameRows(filterGameRows(mapGameRows(database), filters), sort),
		[database, filters, sort],
	);

	const loadNextPage = useCallback(() => {
		setLoadedPageCount((count) => count + 1);
	}, []);

	// Jeux en base hors backlog, comptés sur le bouton « Ma base »
	const databaseGameCount = useMemo(
		() => searchDatabaseGames(database, "").length,
		[database],
	);

	// Recherche IGDB temporisée : une requête 300 ms après la dernière frappe, la précédente est annulée
	useEffect(() => {
		const query = searchQuery.trim();
		if (query === "") {
			return undefined;
		}
		const controller = new AbortController();
		const timer = window.setTimeout(() => {
			setIsSearching(true);
			setSearchError(null);
			searchIgdbGames(query, controller.signal)
				.then((hits) => setSearchResults(hits.map(mapSearchResult)))
				.catch((error: unknown) => {
					if (!controller.signal.aborted) {
						setSearchError(
							error instanceof Error ? error.message : String(error),
						);
					}
				})
				.finally(() => {
					if (!controller.signal.aborted) {
						setIsSearching(false);
					}
				});
		}, searchDelayMs);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [searchQuery]);

	// Modale d'ajout ouverte sans ses données : on les charge depuis IGDB (aussi après un réimport d'état)
	const igdbIdToLoad =
		modal?.kind === "addGame" && modal.gameImport === null
			? modal.igdbId
			: null;
	useEffect(() => {
		if (igdbIdToLoad === null) {
			return undefined;
		}
		const controller = new AbortController();
		fetchIgdbGameData(igdbIdToLoad, controller.signal)
			.then((data) =>
				setModal((current) =>
					receiveGameImport(current, igdbIdToLoad, mapGameImport(data)),
				),
			)
			.catch((error: unknown) => {
				if (!controller.signal.aborted) {
					setModalError(error instanceof Error ? error.message : String(error));
				}
			});
		return () => controller.abort();
	}, [igdbIdToLoad]);

	// « Modifier le jeu » et « Rechercher d'autres DLC » : le jeu est relu sur IGDB à l'ouverture (sections 8 et 9)
	const gameIdToReload =
		(modal?.kind === "editGame" && modal.gameImport === null) ||
		(modal?.kind === "addDlcs" && modal.dlcs === null)
			? modal.gameId
			: null;
	useEffect(() => {
		if (gameIdToReload === null) {
			return undefined;
		}
		const controller = new AbortController();
		fetchIgdbGameData(gameIdToReload, controller.signal)
			.then((data) => mapGameImport(data))
			.then((gameImport) =>
				setModal((current) =>
					receiveGameDlcs(
						receiveEditGameImport(current, gameIdToReload, gameImport),
						gameIdToReload,
						gameImport.dlcs,
					),
				),
			)
			.catch((error: unknown) => {
				if (!controller.signal.aborted) {
					setModalError(error instanceof Error ? error.message : String(error));
				}
			});
		return () => controller.abort();
	}, [gameIdToReload]);

	// Ajout au backlog et « Personnaliser » : les images du jeu sont relues sur IGDB à l'ouverture (section 8)
	const gameIdToLoadImages =
		((modal?.kind === "addUserVersion" && modal.userGameDraft !== null) ||
			modal?.kind === "customizeGame") &&
		modal.imageIds === null
			? modal.gameId
			: null;
	useEffect(() => {
		if (gameIdToLoadImages === null) {
			return undefined;
		}
		const controller = new AbortController();
		fetchIgdbGameImages(gameIdToLoadImages, controller.signal)
			.then((images) =>
				setModal((current) =>
					receiveGameImages(current, gameIdToLoadImages, mapGameImages(images)),
				),
			)
			.catch((error: unknown) => {
				if (!controller.signal.aborted) {
					setModalError(error instanceof Error ? error.message : String(error));
				}
			});
		return () => controller.abort();
	}, [gameIdToLoadImages]);

	// Échap ferme le popover ouvert, sinon la modale comme « Annuler » (DLC suivant de la file) ; rien n'est enregistré avant « Valider »
	const isModalOpen = modal !== null;
	const isPopoverOpen = popover !== null;
	useEffect(() => {
		if (!isModalOpen && !isPopoverOpen) {
			return undefined;
		}
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key !== "Escape") {
				return;
			}
			if (isPopoverOpen) {
				setPopover(null);
			} else {
				setModalError(null);
				setModal((current) =>
					getNextQueuedModal(database, getQueuedGameIds(current)),
				);
			}
		}
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [isModalOpen, isPopoverOpen, database]);

	// Un clic hors du popover ou du menu le ferme
	useEffect(() => {
		if (!isPopoverOpen) {
			return undefined;
		}
		function closeOnOutsideClick(event: PointerEvent) {
			if (!(
				event.target instanceof Element &&
				event.target.closest("[data-popover]") !== null
			)) {
				setPopover(null);
			}
		}
		document.addEventListener("pointerdown", closeOnOutsideClick);
		return () =>
			document.removeEventListener("pointerdown", closeOnOutsideClick);
	}, [isPopoverOpen]);

	// Un clic hors de la barre de recherche ferme la liste des résultats ; revenir dans le champ la rouvre
	useEffect(() => {
		if (!isSearchOpen) {
			return undefined;
		}
		function closeOnOutsideClick(event: PointerEvent) {
			if (!(
				event.target instanceof Element &&
				event.target.closest("[data-search]") !== null
			)) {
				setIsSearchOpen(false);
			}
		}
		document.addEventListener("pointerdown", closeOnOutsideClick);
		return () =>
			document.removeEventListener("pointerdown", closeOnOutsideClick);
	}, [isSearchOpen]);

	// Mode édition : retour en lecture seule après 1 minute d'inactivité (section 9).
	// Une cellule en cours d'édition suspend le minuteur, une modale ouverte aussi.
	useEffect(() => {
		if (!isEditMode || isModalOpen) {
			return undefined;
		}
		let lastActivityAt = Date.now();
		function recordActivity() {
			lastActivityAt = Date.now();
		}
		const timer = window.setInterval(() => {
			if (isEditingCell()) {
				lastActivityAt = Date.now();
			} else if (Date.now() - lastActivityAt >= editModeIdleMs) {
				setIsEditMode(false);
			}
		}, 1000);
		for (const eventName of activityEvents) {
			window.addEventListener(eventName, recordActivity, { passive: true });
		}
		return () => {
			window.clearInterval(timer);
			for (const eventName of activityEvents) {
				window.removeEventListener(eventName, recordActivity);
			}
		};
	}, [isEditMode, isModalOpen]);

	// Ctrl+Z annule, Ctrl+Y rétablit (section 10), aussi en lecture seule. Dans un champ texte,
	// le navigateur garde la main ; pendant qu'une modale est ouverte, les raccourcis sont ignorés.
	// Sans dépendances : l'écouteur est remplacé à chaque rendu et voit toujours l'historique à jour.
	useEffect(() => {
		function undoOrRedo(event: KeyboardEvent) {
			if (
				!(event.ctrlKey || event.metaKey) ||
				isModalOpen ||
				isTextField(event.target)
			) {
				return;
			}
			const key = event.key.toLowerCase();
			if (key === "z" && !event.shiftKey) {
				event.preventDefault();
				undo();
			} else if (key === "y") {
				event.preventDefault();
				redo();
			}
		}
		window.addEventListener("keydown", undoOrRedo);
		return () => window.removeEventListener("keydown", undoOrRedo);
	});

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
			) {
				return;
			}
			event.preventDefault();
			searchInputRef.current?.focus();
		}
		window.addEventListener("keydown", focusSearch);
		return () => window.removeEventListener("keydown", focusSearch);
	}, [isModalOpen]);

	// Même ordre de clés que AppState et initialState : l'export reste comparable au fichier collé
	const state: AppState = {
		database,
		searchQuery,
		searchResults,
		isSearchOpen,
		modal,
		popover,
		isEditMode,
		expandedGameIds,
		columns,
		sort,
		filters,
		loadedPageCount,
	};

	return (
		<LucideProvider
			size={16}
			strokeWidth={1.9}
		>
			<div className={styles.page}>
				{/* Inter, la police de l'interface : React la place dans <head> */}
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin=""
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..700;1,14..32,400..700&display=swap"
					precedence="default"
				/>
				<header className={styles.toolbar}>
					<div className={styles.brand}>
						<span className={styles.brandMark}>
							<Gamepad2 aria-hidden />
						</span>
						<h1 className={styles.title}>Backlog</h1>
					</div>
					<SearchBar
						query={searchQuery}
						isOpen={isSearchOpen}
						results={searchResults}
						isSearching={isSearching}
						error={searchError}
						database={database}
						inputRef={searchInputRef}
						onQueryChange={changeSearchQuery}
						onOpenChange={setIsSearchOpen}
						onSelect={selectSearchResult}
					/>
					<Button
						icon={LibraryBig}
						tooltip={
							databaseGameCount === 0
								? "Tous les jeux de la base sont dans le backlog"
								: "Ajouter au backlog un jeu déjà en base, sans IGDB"
						}
						tooltipPlacement="bottom"
						disabled={databaseGameCount === 0}
						onClick={() =>
							setModal({
								kind: "addFromDatabase",
								query: "",
								loadedPageCount: 1,
							})
						}
					>
						Ma base
						<span className={styles.countBadge}>{databaseGameCount}</span>
					</Button>
					<div className={styles.toolbarEnd}>
						{/* Ctrl+Z et Ctrl+Y à la souris (section 10) */}
						<div
							className={styles.historyButtons}
							role="group"
							aria-label="Historique"
						>
							<Button
								icon={Undo2}
								variant="ghost"
								ariaLabel="Annuler la dernière action"
								tooltip="Annuler la dernière action (Ctrl+Z)"
								tooltipPlacement="bottom"
								disabled={undoHistory.length === 0}
								onClick={undo}
							/>
							<Button
								icon={Redo2}
								variant="ghost"
								ariaLabel="Rétablir l’action annulée"
								tooltip="Rétablir l’action annulée (Ctrl+Y)"
								tooltipPlacement="bottom"
								disabled={redoHistory.length === 0}
								onClick={redo}
							/>
						</div>
						<span
							className={styles.toolbarDivider}
							aria-hidden
						/>
						<Button
							icon={Columns3}
							tooltip="Visibilité et ordre des colonnes"
							tooltipPlacement="bottom"
							onClick={() => setModal({ kind: "editColumns" })}
						>
							Colonnes
						</Button>
						{/* Bouton fixe du mode édition : le tableau est en lecture seule par défaut (section 9) */}
						<Tooltip
							content={
								isEditMode
									? "Repasser en lecture seule (retour automatique après 1 minute sans activité)"
									: "Passer en édition"
							}
							placement="bottom"
						>
							<button
								type="button"
								role="switch"
								aria-checked={isEditMode}
								className={joinClassNames(
									styles.editToggle,
									isEditMode && styles.editToggleOn,
								)}
								onClick={() => setIsEditMode(!isEditMode)}
							>
								{isEditMode ? <PencilLine aria-hidden /> : <Lock aria-hidden />}
								Édition
								<span
									className={styles.editToggleTrack}
									aria-hidden
								/>
							</button>
						</Tooltip>
					</div>
				</header>
				<main className={styles.main}>
					<BacklogTable
						rows={rows}
						columns={columns}
						sort={sort}
						filters={filters}
						expandedGameIds={expandedGameIds}
						loadedPageCount={loadedPageCount}
						database={database}
						isEditMode={isEditMode}
						popover={popover}
						handlers={tableHandlers}
						onToggleSort={(column) => setSort(toggleSort(sort, column))}
						onFilterChange={(column, filter) =>
							setFilters(setColumnFilter(filters, column, filter))
						}
						onClearFilters={() => setFilters([])}
						onLoadNextPage={loadNextPage}
						onFocusSearch={() => searchInputRef.current?.focus()}
					/>
				</main>
				{modal?.kind === "addGame" && (
					<AddGameModal
						// Chaque DLC de la file a sa propre fenêtre : défilement et focus repartent de zéro
						key={modal.igdbId}
						modal={modal}
						database={database}
						error={modalError}
						onModalChange={setModal}
						onCancel={closeModal}
						onValidate={() => validateAddGame(modal)}
					/>
				)}
				{modal?.kind === "editGame" && (
					<EditGameModal
						modal={modal}
						database={database}
						error={modalError}
						onModalChange={setModal}
						onCancel={closeModal}
						onValidate={() => validateEditGame(modal)}
					/>
				)}
				{modal?.kind === "addDlcs" && (
					<AddDlcsModal
						modal={modal}
						database={database}
						error={modalError}
						onModalChange={setModal}
						onCancel={closeModal}
						onValidate={() => validateAddDlcs(modal)}
					/>
				)}
				{modal?.kind === "customizeGame" && (
					<CustomizeGameModal
						modal={modal}
						database={database}
						error={modalError}
						onModalChange={setModal}
						onCancel={closeModal}
						onValidate={() => validateCustomizeGame(modal)}
					/>
				)}
				{modal?.kind === "reorderSeries" && (
					<ReorderSeriesModal
						modal={modal}
						database={database}
						onModalChange={setModal}
						onCancel={closeModal}
						onValidate={() => validateReorderSeries(modal)}
					/>
				)}
				{modal?.kind === "addFromDatabase" && (
					<AddFromDatabaseModal
						modal={modal}
						database={database}
						onModalChange={setModal}
						onSelect={selectSearchResult}
						onCancel={closeModal}
					/>
				)}
				{modal?.kind === "addUserVersion" && (
					<AddUserVersionModal
						key={modal.gameId}
						modal={modal}
						database={database}
						error={modalError}
						onModalChange={setModal}
						onCancel={closeModal}
						onValidate={() => validateAddUserVersion(modal)}
					/>
				)}
				{modal?.kind === "editColumns" && (
					<ColumnsModal
						columns={columns}
						onToggleVisibility={changeColumnVisibility}
						onMove={(key, offset) =>
							setColumns(moveColumn(columns, key, offset))
						}
						onClose={closeModal}
					/>
				)}
				{modal?.kind === "setFinishDate" && (
					<FinishDateModal
						modal={modal}
						database={database}
						onModalChange={setModal}
						onCancel={closeModal}
						onValidate={() => validateFinishDate(modal)}
					/>
				)}
				<DebugFooter
					state={state}
					undoHistoryLength={undoHistory.length}
					redoHistoryLength={redoHistory.length}
				/>
			</div>
		</LucideProvider>
	);
}
