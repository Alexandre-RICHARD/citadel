import {
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import styles from "./backlog.module.scss";
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
	buildInitialStateFile,
	buildViewSearch,
	columnFilterKinds,
	convertStatus,
	databasePageSize,
	describeFilters,
	describeSort,
	describeVersionPlatforms,
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
	keepSelection,
	keepVisibleColumns,
	loadSavedColumns,
	moveColumn,
	parseIsoDate,
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
	trimToNull,
	updateUserVersion,
} from "./utils";

// ---------- Petits composants ----------

/** Icônes embarquées dans `icons/`, nommées par le nom technique de leur plateforme (ex. `ps2.svg`) */
const platformIconUrls = import.meta.glob<string>("./icons/*.svg", {
	eager: true,
	query: "?url",
	import: "default",
});

/** Miniature IGDB : `t_thumb`, et `t_thumb_2x` pour les écrans haute densité */
function Thumbnail({ imageId }: { imageId: IgdbImageId | null }) {
	if (imageId === null) {
		return <span className={styles.thumbnailPlaceholder}>🎮</span>;
	}
	return (
		<img
			className={styles.thumbnail}
			src={getIgdbImageUrl(imageId, "thumb")}
			srcSet={`${getIgdbImageUrl(imageId, "thumb", true)} 2x`}
			alt=""
			loading="lazy"
		/>
	);
}

/** Société : logo au-dessus du nom */
function CompanyLabel({ company }: { company: Company | null }) {
	if (company === null) {
		return <span>—</span>;
	}
	return (
		<span className={styles.company}>
			{company.logoImageId !== null && (
				<img
					src={getIgdbImageUrl(company.logoImageId, "logo_med")}
					alt=""
				/>
			)}
			<span>{company.name}</span>
		</span>
	);
}

/** Plateforme : icône et nom, le nom seul si l'icône manque */
function PlatformLabel({ platform }: { platform: Platform }) {
	const iconUrl: string | undefined =
		platformIconUrls[`./icons/${platform.technicalName}.svg`];
	return (
		<span className={styles.platform}>
			{iconUrl !== undefined && (
				<img
					src={iconUrl}
					alt=""
				/>
			)}
			<span>{platform.shortName}</span>
		</span>
	);
}

function ModalFrame({
	title,
	isCompact = false,
	actions,
	children,
}: {
	title: string;
	isCompact?: boolean;
	actions: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className={styles.overlay}>
			<div
				className={isCompact ? styles.compactModal : styles.modal}
				role="dialog"
				aria-modal="true"
				aria-label={title}
			>
				<h2 className={styles.modalTitle}>{title}</h2>
				<div className={styles.modalBody}>{children}</div>
				<div className={styles.modalActions}>{actions}</div>
			</div>
		</div>
	);
}

// ---------- Champs d'édition des cellules : enregistrés à la sortie du champ, une seule modification par saisie ----------

function blurOnEnter(event: ReactKeyboardEvent<HTMLElement>) {
	if (event.key === "Enter") {
		event.currentTarget.blur();
	}
}

/** Nombre entier ; une valeur refusée remet le champ à la valeur enregistrée */
function NumberField({
	value,
	min,
	max,
	isNullable,
	label,
	onCommit,
}: {
	value: number | null;
	min: number;
	max: number | null;
	isNullable: boolean;
	label: string;
	onCommit: (value: number | null) => void;
}) {
	return (
		<input
			key={value ?? ""}
			type="number"
			className={styles.numberField}
			min={min}
			max={max ?? undefined}
			step={1}
			defaultValue={value ?? ""}
			aria-label={label}
			onKeyDown={blurOnEnter}
			onBlur={(event) => {
				const input = event.currentTarget;
				const text = input.value.trim();
				const number = text === "" ? null : Number(text);
				const isValid =
					number === null
						? isNullable
						: Number.isInteger(number) &&
							number >= min &&
							(max === null || number <= max);
				if (!isValid) {
					input.value = value === null ? "" : String(value);
				} else if (number !== value) {
					onCommit(number);
				}
			}}
		/>
	);
}

/** Durée saisie en heures et minutes, enregistrée en minutes quand le focus quitte les deux champs */
function DurationField({
	minutes,
	label,
	onCommit,
}: {
	minutes: number;
	label: string;
	onCommit: (minutes: number) => void;
}) {
	const hoursRef = useRef<HTMLInputElement>(null);
	const minutesRef = useRef<HTMLInputElement>(null);

	function commit() {
		const hoursInput = hoursRef.current;
		const minutesInput = minutesRef.current;
		if (hoursInput === null || minutesInput === null) {
			return;
		}
		const hours = Number(hoursInput.value || "0");
		const extraMinutes = Number(minutesInput.value || "0");
		if (
			!Number.isInteger(hours) ||
			!Number.isInteger(extraMinutes) ||
			hours < 0 ||
			extraMinutes < 0
		) {
			hoursInput.value = String(Math.floor(minutes / 60));
			minutesInput.value = String(minutes % 60);
			return;
		}
		const total = hours * 60 + extraMinutes;
		if (total !== minutes) {
			onCommit(total);
		}
	}

	return (
		<span
			key={minutes}
			className={styles.fieldGroup}
			onBlur={(event) => {
				// Passer des heures aux minutes n'enregistre rien : seulement en quittant les deux champs
				if (!(
					event.relatedTarget instanceof Node &&
					event.currentTarget.contains(event.relatedTarget)
				)) {
					commit();
				}
			}}
		>
			<input
				ref={hoursRef}
				type="number"
				className={styles.numberField}
				min={0}
				step={1}
				defaultValue={Math.floor(minutes / 60)}
				aria-label={`${label} : heures`}
				onKeyDown={blurOnEnter}
			/>
			h
			<input
				ref={minutesRef}
				type="number"
				className={styles.numberField}
				min={0}
				step={1}
				defaultValue={minutes % 60}
				aria-label={`${label} : minutes`}
				onKeyDown={blurOnEnter}
			/>
		</span>
	);
}

function TextField({
	value,
	label,
	onCommit,
}: {
	value: string | null;
	label: string;
	onCommit: (value: string | null) => void;
}) {
	return (
		<input
			key={value ?? ""}
			type="text"
			className={styles.textField}
			defaultValue={value ?? ""}
			aria-label={label}
			onKeyDown={blurOnEnter}
			onBlur={(event) => {
				const text = trimToNull(event.currentTarget.value);
				if (text !== value) {
					onCommit(text);
				}
			}}
		/>
	);
}

function DateField({
	value,
	label,
	onCommit,
}: {
	value: IsoDate | null;
	label: string;
	onCommit: (value: IsoDate | null) => void;
}) {
	return (
		<input
			key={value ?? ""}
			type="date"
			className={styles.dateField}
			defaultValue={value ?? ""}
			aria-label={label}
			onKeyDown={blurOnEnter}
			onBlur={(event) => {
				const input = event.currentTarget;
				const date = input.value === "" ? null : parseIsoDate(input.value);
				// Une date à moitié saisie n'efface pas la date enregistrée
				if (input.validity.badInput || (input.value !== "" && date === null)) {
					input.value = value ?? "";
				} else if (date !== value) {
					onCommit(date);
				}
			}}
		/>
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
	title,
	ariaLabel,
	onCommit,
}: {
	value: number | null;
	entries: SeriesEntry[];
	isLive: boolean;
	className?: string;
	title?: string | undefined;
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
			className={className ?? styles.seriesNumberField}
			title={title}
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

/** Une ligne de résultat : miniature, noms, année, plateformes, « via … » ; `badge` à droite */
function SearchResultButton({
	result,
	badge,
	onSelect,
}: {
	result: SearchResult;
	badge: ReactNode;
	onSelect: (result: SearchResult) => void;
}) {
	return (
		<button
			type="button"
			className={styles.searchResult}
			onClick={() => onSelect(result)}
		>
			<Thumbnail imageId={result.coverImageId} />
			<span className={styles.searchResultName}>
				<strong>{result.frenchName ?? result.name}</strong>
				{result.frenchName !== null && (
					<span className={styles.originalName}> {result.name}</span>
				)}
				{result.releaseYear !== null && ` (${result.releaseYear})`}
				{/* 3 plateformes au plus, puis le nombre restant */}
				{result.platformNames.length > 0 && (
					<span className={styles.originalName}>
						{` · ${result.platformNames.slice(0, 3).join(", ")}`}
						{result.platformNames.length > 3 &&
							` +${result.platformNames.length - 3}`}
					</span>
				)}
				{/* Trouvé par une autre fiche que la sienne : édition, bundle, DLC… */}
				{result.matchedName !== null && (
					<span className={styles.matchedName}>
						via « {result.matchedName} »
					</span>
				)}
			</span>
			{badge}
		</button>
	);
}

/** Recherche sur IGDB seulement ; les jeux en base hors backlog passent par « 📚 Ma base » (section 8) */
function SearchBar({
	query,
	isOpen,
	results,
	isSearching,
	error,
	database,
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
	onQueryChange: (query: string) => void;
	onOpenChange: (isOpen: boolean) => void;
	onSelect: (result: SearchResult) => void;
}) {
	return (
		<div
			className={styles.search}
			data-search
		>
			<input
				type="search"
				className={styles.searchInput}
				placeholder="🔍 Rechercher un jeu sur IGDB"
				aria-label="Rechercher un jeu sur IGDB"
				value={query}
				onChange={(event) => onQueryChange(event.target.value)}
				onFocus={() => onOpenChange(true)}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						onOpenChange(false);
					}
				}}
			/>
			{isOpen && query.trim() !== "" && (
				<ul className={styles.searchResults}>
					{isSearching && (
						<li className={styles.searchMessage}>⏳ Recherche…</li>
					)}
					{error !== null && (
						<li className={styles.searchMessage}>⚠️ {error}</li>
					)}
					{!isSearching && error === null && results.length === 0 && (
						<li className={styles.searchMessage}>Aucun résultat</li>
					)}
					{results.map((result) => (
						<li key={result.id}>
							<SearchResultButton
								result={result}
								badge={
									database.versions.some(({ id }) => id === result.id) && (
										<span className={styles.inDatabaseBadge}>
											✅ déjà en base
										</span>
									)
								}
								onSelect={onSelect}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

/**
 * « 📚 Ma base » (section 8) : les jeux en base hors backlog, triés par nom, filtrés sans requête IGDB.
 * 50 jeux, puis la page suivante à l'approche du bas de la liste. Un jeu choisi ouvre l'ajout au backlog.
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
		<ModalFrame
			title="📚 Ajouter depuis ma base"
			actions={
				<button
					type="button"
					className={styles.button}
					onClick={onCancel}
				>
					Annuler
				</button>
			}
		>
			<input
				type="search"
				className={styles.databaseGameFilter}
				placeholder="🔍 Filtrer par nom ou titre de version"
				aria-label="Filtrer les jeux de ma base"
				value={modal.query}
				onChange={(event) =>
					onModalChange({
						...modal,
						query: event.target.value,
						loadedPageCount: 1,
					})
				}
			/>
			<ul
				ref={listRef}
				className={styles.databaseGameList}
			>
				{games.length === 0 && (
					<li className={styles.searchMessage}>
						{modal.query.trim() === ""
							? "Tous les jeux de la base sont dans le backlog"
							: "Aucun résultat"}
					</li>
				)}
				{shownGames.map((game) => (
					<li key={game.id}>
						<SearchResultButton
							result={mapDatabaseSearchResult(database, game)}
							badge={null}
							onSelect={onSelect}
						/>
					</li>
				))}
				{hasMoreGames && (
					<li
						ref={loadMoreRef}
						className={styles.searchMessage}
					>
						⏳ {games.length - shownGames.length} jeux de plus…
					</li>
				)}
			</ul>
		</ModalFrame>
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
		<div className={styles.choiceRow}>
			<label>
				Version
				<select
					value={versionId ?? ""}
					onChange={(event) =>
						onChange({
							...draft,
							versionId:
								event.target.value === "" ? null : Number(event.target.value),
							platformId: null,
						})
					}
				>
					<option value="">— Choisir —</option>
					{versions.map((version) => (
						<option
							key={version.id}
							value={version.id}
						>
							{getVersionLabel(version, gameName, versionPlatforms, platforms)}
						</option>
					))}
				</select>
			</label>
			<label>
				Plateforme
				<select
					value={platformId ?? ""}
					disabled={versionId === null}
					onChange={(event) =>
						onChange({
							...draft,
							platformId:
								event.target.value === "" ? null : Number(event.target.value),
						})
					}
				>
					<option value="">— Choisir —</option>
					{platformOptions.map((platform) => {
						const isInBacklog = userVersions.some(
							(userVersion) =>
								userVersion.versionId === versionId &&
								userVersion.platformId === platform.id,
						);
						return (
							<option
								key={platform.id}
								value={platform.id}
								disabled={isInBacklog}
							>
								{`${platform.shortName}${platform.emulatedPlatformId === null ? "" : " (émulateur)"}${isInBacklog ? " — déjà dans le backlog" : ""}`}
							</option>
						);
					})}
				</select>
			</label>
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

	return (
		<>
			<section>
				<h3>Miniature</h3>
				{imageIds === null && imageError === null && (
					<p>⏳ Chargement des images IGDB…</p>
				)}
				{imageError !== null && <p>⚠️ {imageError}</p>}
				{imageIds !== null && shownImageIds.length === 0 && (
					<p>Aucune image sur IGDB</p>
				)}
				{shownImageIds.length > 0 && (
					<div className={styles.imageChoices}>
						{shownImageIds.map((imageId) => (
							<button
								key={imageId}
								type="button"
								className={
									imageId === draft.imageId
										? styles.selectedImageChoice
										: styles.imageChoice
								}
								aria-pressed={imageId === draft.imageId}
								onClick={() => onChange({ ...draft, imageId })}
							>
								<Thumbnail imageId={imageId} />
							</button>
						))}
					</div>
				)}
			</section>

			<section className={styles.choiceRow}>
				<label>
					Type de fin
					<select
						value={draft.endingType}
						onChange={(event) =>
							onChange({
								...draft,
								endingType:
									endingTypeDefinitions.find(
										({ key }) => key === event.target.value,
									)?.key ?? draft.endingType,
							})
						}
					>
						{endingTypeDefinitions.map(({ key, label }) => (
							<option
								key={key}
								value={key}
							>
								{label}
							</option>
						))}
					</select>
				</label>
				<span className={styles.hint}>{endingType?.meaning}</span>
			</section>

			<section className={styles.choiceRow}>
				<label>
					Série
					<select
						value={seriesValue}
						onChange={(event) =>
							changeSeries(parseSeriesValue(event.target.value))
						}
					>
						<option value="proposed">
							{proposedSeries === null
								? "Aucune (IGDB n’en propose pas)"
								: `${proposedSeries.name} (IGDB)`}
						</option>
						{proposedSeries !== null && <option value="none">Aucune</option>}
						{otherSeries.map(({ id, name }) => (
							<option
								key={id}
								value={`other-${id}`}
							>
								{name}
							</option>
						))}
						<option value="new">➕ Nouvelle série…</option>
					</select>
				</label>
				{draft.series.kind === "new" && (
					<label>
						Nom de la nouvelle série
						<input
							type="text"
							value={draft.series.name}
							// eslint-disable-next-line jsx-a11y/no-autofocus -- le champ apparaît au choix de « Nouvelle série »
							autoFocus
							onChange={(event) =>
								onChange({
									...draft,
									series: { kind: "new", name: event.target.value },
								})
							}
						/>
					</label>
				)}
				{seriesValue !== "proposed" && (
					<button
						type="button"
						className={styles.iconButton}
						title={`Revenir à la série proposée par IGDB : ${proposedSeries?.name ?? "aucune"}`}
						onClick={() => changeSeries({ kind: "proposed" })}
					>
						↩️ Série IGDB
					</button>
				)}
				{hasSeries && (
					// eslint-disable-next-line jsx-a11y/label-has-associated-control -- le champ est l'input de SeriesNumberField
					<label>
						N° dans la série
						<SeriesNumberField
							// Un autre choix de série pré-remplit un autre numéro
							key={seriesValue}
							value={draft.seriesNumber}
							entries={seriesEntries}
							isLive
							onCommit={(seriesNumber) => onChange({ ...draft, seriesNumber })}
						/>
					</label>
				)}
			</section>
			{draft.seriesNumber !== null && seriesNumberOwner !== null && (
				<p className={styles.hint}>
					ℹ️ N° {formatSeriesNumber(draft.seriesNumber, seriesEntries)} déjà
					pris par {seriesNumberOwner.frenchName ?? seriesNumberOwner.name} : il
					sera décalé d’un cran, avec les suivants si besoin.
				</p>
			)}
		</>
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
			<section>
				<p className={styles.previewName}>
					<strong>{game.frenchName ?? game.name}</strong>
					{game.frenchName !== null && (
						<span className={styles.originalName}> {game.name}</span>
					)}
				</p>
				<p>
					Sortie : {formatReleaseDate(game.firstReleaseDate, game.isCancelled)}
					{originalVersion !== undefined && (
						<>
							{" · "}
							<a
								href={originalVersion.igdbUrl}
								target="_blank"
								rel="noreferrer"
							>
								Ouvrir sur IGDB ↗️
							</a>
						</>
					)}
				</p>
			</section>

			<dl className={styles.facts}>
				<dt>Série proposée</dt>
				<dd>{proposedSeries?.name ?? "—"}</dd>
				<dt>Développeur</dt>
				<dd>
					<CompanyLabel company={developer} />
				</dd>
				<dt>Éditeur</dt>
				<dd>
					<CompanyLabel company={publisher} />
				</dd>
			</dl>

			<section>
				<h3>
					Versions à enregistrer (
					{versions.filter(({ id }) => isVersionChecked(id)).length} /{" "}
					{versions.length})
				</h3>
				<ul className={styles.checkList}>
					{versions.map((version) => {
						const isOriginal = version.id === game.id;
						return (
							<li key={version.id}>
								<label
									title={
										isOriginal
											? "Toujours enregistrée : c’est la fiche du jeu"
											: isVersionLocked(version.id)
												? "Déjà en base"
												: undefined
									}
								>
									<input
										type="checkbox"
										checked={isVersionChecked(version.id)}
										disabled={isVersionLocked(version.id)}
										onChange={() =>
											onSelectionChange({
												...selection,
												versionIds: toggleId(selection.versionIds, version.id),
											})
										}
									/>
									<strong>{version.title ?? `${game.name} (originale)`}</strong>
									<span className={styles.hint}>
										{" "}
										{describeVersionPlatforms(
											version.id,
											versionPlatforms,
											platforms,
										)}
									</span>
								</label>
							</li>
						);
					})}
				</ul>
			</section>

			<section>
				<h3>
					DLC à enregistrer ({dlcs.filter(({ id }) => isDlcChecked(id)).length}{" "}
					/ {dlcs.length})
				</h3>
				{dlcs.length === 0 ? (
					<p>Aucun DLC</p>
				) : (
					<ul className={styles.checkList}>
						{dlcs.map(({ id, name }) => {
							const isGameStored = findById(database.games, id) !== null;
							return (
								<li
									key={id}
									className={styles.dlcChoice}
								>
									<label title={isDlcStored(id) ? "Déjà en base" : undefined}>
										<input
											type="checkbox"
											checked={isDlcChecked(id)}
											disabled={isDlcStored(id)}
											onChange={() =>
												onSelectionChange({
													...selection,
													dlcIds: toggleId(selection.dlcIds, id),
												})
											}
										/>
										{name}
									</label>
									{/* Indépendante de la case DLC : un DLC peut être les deux (section 5) */}
									<label
										title={
											isGameStored
												? "Déjà en base comme jeu"
												: "Après « Valider », ouvre l’ajout de ce DLC comme jeu à part ; il peut rester DLC en même temps"
										}
									>
										<input
											type="checkbox"
											checked={selection.dlcAsGameIds.includes(id)}
											disabled={isGameStored}
											onChange={() =>
												onSelectionChange({
													...selection,
													dlcAsGameIds: toggleId(selection.dlcAsGameIds, id),
												})
											}
										/>
										🧩 comme jeu
									</label>
								</li>
							);
						})}
					</ul>
				)}
			</section>

			{warnings.length > 0 && (
				<section className={styles.warnings}>
					<h3>⚠️ Données IGDB hors modèle ({warnings.length})</h3>
					{warnings.map(({ message, entryJson }) => (
						<details key={entryJson}>
							<summary>{message}</summary>
							<pre>{entryJson}</pre>
						</details>
					))}
				</section>
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
			<button
				type="button"
				className={styles.button}
				onClick={onCancel}
			>
				{cancelLabel}
			</button>
			<button
				type="button"
				className={styles.primaryButton}
				disabled={!canValidate}
				onClick={onValidate}
			>
				{validateLabel}
			</button>
		</>
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
		<ModalFrame
			title="Ajouter un jeu"
			actions={
				<>
					<label
						className={styles.actionsOption}
						title="Après « Valider », ouvre l’ajout au backlog : personnalisation, version jouée, plateforme et tes données"
					>
						<input
							type="checkbox"
							checked={modal.isAddingToBacklog}
							onChange={() =>
								onModalChange({
									...modal,
									isAddingToBacklog: !modal.isAddingToBacklog,
								})
							}
						/>
						Ajouter à mon backlog
					</label>
					<ModalActions
						canValidate={gameImport !== null}
						onCancel={onCancel}
						onValidate={onValidate}
					/>
				</>
			}
		>
			{gameImport === null ? (
				<p>
					{error === null ? "⏳ Chargement des données IGDB…" : `⚠️ ${error}`}
				</p>
			) : (
				<>
					{database.games.some(({ id }) => id === gameImport.game.id) && (
						<p className={styles.notice}>
							ℹ️ Ce jeu est déjà en base : seules les fiches manquantes
							s’ajouteront.
						</p>
					)}
					<GamePreview
						gameImport={gameImport}
						database={database}
						selection={modal.selection}
						onSelectionChange={(selection) =>
							onModalChange({ ...modal, selection })
						}
					/>
				</>
			)}
		</ModalFrame>
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
		<ModalFrame
			title="Modifier le jeu"
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
		>
			{game === null ? (
				<p>Jeu introuvable en base.</p>
			) : (
				<>
					{error !== null && <p className={styles.notice}>⚠️ {error}</p>}
					{isLoadingIgdb && (
						<p className={styles.notice}>
							⏳ Chargement des versions et DLC IGDB absents de la base…
						</p>
					)}
					<GamePreview
						gameImport={mapEditGameImport(database, game, modal.gameImport)}
						database={database}
						selection={modal.selection}
						onSelectionChange={(selection) =>
							onModalChange({ ...modal, selection })
						}
					/>
				</>
			)}
		</ModalFrame>
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
		<ModalFrame
			title={`Personnaliser : ${game === null ? "jeu introuvable" : (game.frenchName ?? game.name)}`}
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
		>
			{game === null || userGame === null ? (
				<p>Jeu introuvable dans le backlog.</p>
			) : (
				<>
					{modal.draft.endingType !== userGame.endingType && (
						<p className={styles.notice}>
							ℹ️ Changer le type de fin convertit les statuts devenus
							incompatibles : Fini ↔ Estimé fini, Vu sans jouer → Pas commencé.
						</p>
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
				</>
			)}
		</ModalFrame>
	);
}

/** Décalage d'un sous-jeu dans « Réorganiser la série », en pixels (2rem) : glisser de sa moitié vers la droite en fait un sous-jeu */
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
		<ModalFrame
			title={`Réorganiser la série : ${series?.name ?? "série introuvable"}`}
			actions={
				// Sans numéro changé, « Valider » reste inactif
				<ModalActions
					canValidate={hasSeriesOrderChanges(database, entries)}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
		>
			<p className={styles.notice}>
				ℹ️ Glisse un jeu par ↕️ entre deux lignes, un peu à droite pour en faire
				un sous-jeu, ou tape son numéro (3, 3.1).
			</p>
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
							<span
								className={styles.dragHandle}
								draggable
								title="Glisser pour déplacer"
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
								↕️
							</span>
							<SeriesNumberField
								value={seriesNumber}
								entries={otherEntries}
								isLive={false}
								className={
									isChanged
										? styles.changedSeriesNumberField
										: styles.seriesNumberField
								}
								title={
									isChanged
										? `Avant : ${storedNumber === undefined || storedNumber === null ? "aucun" : formatSeriesNumber(storedNumber, otherEntries)}`
										: undefined
								}
								ariaLabel={`N° de ${game === null ? `jeu ${gameId}` : (game.frenchName ?? game.name)}`}
								onCommit={(nextNumber) =>
									onModalChange({
										...modal,
										entries: placeSeriesEntry(entries, gameId, nextNumber),
									})
								}
							/>
							{game === null ? (
								<span>Jeu introuvable</span>
							) : (
								<>
									<span className={styles.nameCell}>
										<strong>{game.frenchName ?? game.name}</strong>
										{game.frenchName !== null && (
											<span className={styles.originalName}>{game.name}</span>
										)}
									</span>
									<span>
										{formatReleaseDate(game.firstReleaseDate, game.isCancelled)}
									</span>
								</>
							)}
							<span>
								{conflict !== undefined && (
									<span
										className={styles.help}
										title={`Sorti avant ${conflict.frenchName ?? conflict.name}, placé plus haut`}
									>
										⚠️
									</span>
								)}
							</span>
						</li>
					);
				})}
			</ol>
		</ModalFrame>
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
		<ModalFrame
			title={`Autres DLC : ${game === null ? "jeu introuvable" : (game.frenchName ?? game.name)}`}
			actions={
				<ModalActions
					canValidate={modal.dlcIds.length > 0}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
		>
			{modal.dlcs === null && (
				<p>{error === null ? "⏳ Chargement des DLC IGDB…" : `⚠️ ${error}`}</p>
			)}
			{modal.dlcs?.length === 0 && <p>Aucun DLC sur IGDB</p>}
			{modal.dlcs !== null && modal.dlcs.length > 0 && (
				<>
					<p className={styles.notice}>
						ℹ️ Les DLC cochés rejoignent le jeu : ils s’ajoutent à la liste des
						DLC de toutes ses versions jouées.
					</p>
					<ul className={styles.checkList}>
						{modal.dlcs.map(({ id, name }) => {
							const isStored = findById(database.dlcs, id) !== null;
							return (
								<li key={id}>
									<label title={isStored ? "Déjà en base" : undefined}>
										<input
											type="checkbox"
											checked={isStored || modal.dlcIds.includes(id)}
											disabled={isStored}
											onChange={() =>
												onModalChange({
													...modal,
													dlcIds: toggleId(modal.dlcIds, id),
												})
											}
										/>
										{name}
									</label>
								</li>
							);
						})}
					</ul>
				</>
			)}
		</ModalFrame>
	);
}

/* eslint-disable jsx-a11y/label-has-associated-control -- les champs maison (DateField, NumberField…) rendent leur <input> dans le <label> */
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
		<>
			<div className={styles.choiceRow}>
				<label>
					Statut
					<select
						value={draft.status}
						onChange={(event) => {
							const status = statusDefinitions.find(
								({ key }) => key === event.target.value,
							)?.key;
							if (status !== undefined) {
								onChange({ ...draft, status });
							}
						}}
					>
						{/* Liste filtrée par type de fin (section 6) */}
						{statusDefinitions
							.filter(({ key }) => isStatusAllowed(key, endingType))
							.map(({ key, label }) => (
								<option
									key={key}
									value={key}
								>
									{label}
								</option>
							))}
					</select>
				</label>
				<label>
					Date de fin
					<DateField
						value={draft.finishDate}
						label="Date de fin"
						onCommit={(finishDate) => onChange({ ...draft, finishDate })}
					/>
				</label>
				<label>
					Fois fini
					<span className={styles.fieldGroup}>
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
						+
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
						?
					</span>
				</label>
			</div>
			<div className={styles.checkRow}>
				<label>
					<input
						type="checkbox"
						checked={draft.isUpNext}
						onChange={() => onChange({ ...draft, isUpNext: !draft.isUpNext })}
					/>
					À jouer bientôt
				</label>
				<label>
					<input
						type="checkbox"
						checked={draft.isOwned}
						onChange={() => onChange({ ...draft, isOwned: !draft.isOwned })}
					/>
					Possédé
				</label>
			</div>
			<div className={styles.choiceRow}>
				<label>
					Temps relevé
					<DurationField
						minutes={draft.trackedPlayTimeMinutes}
						label="Temps relevé"
						onCommit={(minutes) =>
							onChange({ ...draft, trackedPlayTimeMinutes: minutes })
						}
					/>
				</label>
				<label>
					Temps estimé
					<DurationField
						minutes={draft.estimatedPlayTimeMinutes}
						label="Temps estimé"
						onCommit={(minutes) =>
							onChange({ ...draft, estimatedPlayTimeMinutes: minutes })
						}
					/>
				</label>
				<label>
					Note sur 20
					<NumberField
						value={draft.rating}
						min={0}
						max={20}
						isNullable
						label="Note sur 20"
						onCommit={(rating) => onChange({ ...draft, rating })}
					/>
				</label>
			</div>
			<div className={styles.choiceRow}>
				<label>
					Commentaire
					<TextField
						value={draft.comment}
						label="Commentaire"
						onCommit={(comment) => onChange({ ...draft, comment })}
					/>
				</label>
			</div>
			{dlcs.length > 0 && (
				<fieldset className={styles.checkGroup}>
					<legend>DLC faits</legend>
					<ul className={styles.checkList}>
						{dlcs.map((dlc) => (
							<li key={dlc.id}>
								<label>
									<input
										type="checkbox"
										checked={draft.doneDlcIds.includes(dlc.id)}
										onChange={() =>
											onChange({
												...draft,
												doneDlcIds: draft.doneDlcIds.includes(dlc.id)
													? draft.doneDlcIds.filter((id) => id !== dlc.id)
													: [...draft.doneDlcIds, dlc.id],
											})
										}
									/>
									{dlc.name}
								</label>
							</li>
						))}
					</ul>
				</fieldset>
			)}
		</>
	);
}

/* eslint-enable jsx-a11y/label-has-associated-control */

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
		<ModalFrame
			title={
				userGameDraft === null
					? `Ajouter une version jouée : ${gameName}`
					: `Ajouter au backlog : ${gameName}`
			}
			actions={
				<ModalActions
					canValidate={canValidate}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
		>
			{game !== null && userGameDraft !== null && (
				<section className={styles.backlogOption}>
					<h3>Personnalisation</h3>
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
			<p className={styles.notice}>
				ℹ️ Choisis la version jouée, puis la plateforme.
				{userGameDraft !== null &&
					" Annuler laisse le jeu en base, hors du backlog."}
			</p>
			<VersionPlatformFields
				gameName={game?.name ?? ""}
				versions={database.versions.filter(
					({ gameId }) => gameId === modal.gameId,
				)}
				versionPlatforms={database.versionPlatforms}
				platforms={database.platforms}
				userVersions={database.userVersions}
				draft={draft}
				onChange={(nextDraft) => onModalChange({ ...modal, draft: nextDraft })}
			/>
			{game !== null && (
				<section className={styles.backlogOption}>
					<h3>Mes données (optionnel)</h3>
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
		</ModalFrame>
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
		<ModalFrame
			title="Date de fin"
			isCompact
			actions={
				<ModalActions
					cancelLabel="Plus tard"
					canValidate={userVersion !== null}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
		>
			<p>
				🏁 {game === null ? "Ce jeu" : (game.frenchName ?? game.name)}
				{platform === null ? "" : ` sur ${platform.shortName}`} : quand l’as-tu
				fini pour la première fois ?
			</p>
			<div className={styles.choiceRow}>
				<label>
					Date de fin
					<input
						type="date"
						value={modal.finishDate}
						onChange={(event) => {
							const finishDate = parseIsoDate(event.target.value);
							if (finishDate !== null) {
								onModalChange({ ...modal, finishDate });
							}
						}}
					/>
				</label>
			</div>
		</ModalFrame>
	);
}

// ---------- Tableau (sections 5, 7 et 9) ----------

/** Bulles explicatives des en-têtes : la signification des valeurs */
const columnHelp: Partial<Record<ColumnKey, string>> = {
	endingType: endingTypeDefinitions
		.map(({ label, meaning }) => `${label} : ${meaning}`)
		.join("\n"),
	status: statusDefinitions
		.map(({ rank, label, meaning }) => `${rank ?? "–"} · ${label} : ${meaning}`)
		.join("\n"),
};

/** Colonnes propres au jeu, toujours en lecture seule */
const gameInfoRenderers: Partial<
	Record<ColumnKey, (row: GameRow) => ReactNode>
> = {
	thumbnail: (row) => <Thumbnail imageId={row.imageId} />,
	// Nom VF, nom VO en dessous s'il diffère ; ligne à version jouée unique : titre de sa version
	name: (row) => (
		<span className={styles.nameCell}>
			<strong>{row.frenchName ?? row.name}</strong>
			{row.frenchName !== null && (
				<span className={styles.originalName}>{row.name}</span>
			)}
			{row.versionTitle !== null && (
				<span className={styles.versionTitle}>{row.versionTitle}</span>
			)}
		</span>
	),
	seriesNumber: (row) => row.seriesNumberLabel,
	developer: (row) =>
		row.developer === null ? null : <CompanyLabel company={row.developer} />,
	publisher: (row) =>
		row.publisher === null ? null : <CompanyLabel company={row.publisher} />,
	releaseDate: (row) => formatReleaseDate(row.releaseDate, row.isCancelled),
	endingType: (row) => getEndingTypeLabel(row.endingType),
	platform: (row) =>
		row.platform === null ? null : <PlatformLabel platform={row.platform} />,
};

/** Colonnes propres à la version de la sous-ligne ; les colonnes du jeu y restent vides */
const userVersionInfoRenderers: Partial<
	Record<ColumnKey, (row: UserVersionRow) => ReactNode>
> = {
	thumbnail: (row) => <Thumbnail imageId={row.coverImageId} />,
	name: (row) => (
		<span className={styles.versionTitle}>
			{row.versionTitle ?? "Version originale"}
		</span>
	),
	series: () => null,
	seriesNumber: () => null,
	developer: () => null,
	publisher: () => null,
	releaseDate: (row) => formatReleaseDate(row.releaseDate, false),
	endingType: () => null,
	platform: (row) => <PlatformLabel platform={row.platform} />,
};

/** En-tête : un clic trie (⬆️, ⬇️, puis sans tri), avec le numéro de priorité du critère */
function ColumnHeader({
	column,
	sort,
	onToggleSort,
}: {
	column: ColumnKey;
	sort: SortCriterion[];
	onToggleSort: (column: ColumnKey) => void;
}) {
	const help = columnHelp[column];
	const label = getColumnLabel(column);
	const priority = sort.findIndex((criterion) => criterion.column === column);
	const criterion = sort.find((current) => current.column === column);

	return (
		<th scope="col">
			{isSortableColumn(column) ? (
				<button
					type="button"
					className={styles.sortButton}
					title="Trier : ⬆️, puis ⬇️, puis sans tri"
					onClick={() => onToggleSort(column)}
				>
					{label}
					{criterion !== undefined && (
						<span className={styles.sortIndicator}>
							{`${criterion.direction === "asc" ? "⬆️" : "⬇️"}${priority + 1}`}
						</span>
					)}
				</button>
			) : (
				label
			)}
			{help !== undefined && (
				<span
					className={styles.help}
					title={help}
				>
					{" ℹ️"}
				</span>
			)}
		</th>
	);
}

/**
 * « faits / total » ; un clic ouvre la liste des DLC du jeu, à cocher en mode édition (section 9).
 * En mode édition, elle mène aussi à « Rechercher d'autres DLC », même pour un jeu sans DLC (« ➕ »).
 */
function DlcCell({
	userVersion,
	gameId,
	label,
	database,
	isEditMode,
	popover,
	handlers,
}: {
	userVersion: UserVersion;
	gameId: number;
	label: string;
	database: Database;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
}) {
	const isOpen =
		popover?.kind === "dlc" && popover.userVersionId === userVersion.id;
	const dlcs = database.dlcs.filter((dlc) => dlc.gameId === gameId);

	return (
		<span
			className={styles.popoverAnchor}
			data-popover
		>
			<button
				type="button"
				className={styles.linkButton}
				aria-expanded={isOpen}
				onClick={() =>
					handlers.setPopover(
						isOpen ? null : { kind: "dlc", userVersionId: userVersion.id },
					)
				}
			>
				{label}
			</button>
			{isOpen && (
				<div className={styles.popover}>
					<p className={styles.popoverTitle}>
						{isEditMode ? "DLC faits" : "DLC faits (lecture seule)"}
					</p>
					<ul>
						{dlcs.map((dlc) => (
							<li key={dlc.id}>
								<label>
									<input
										type="checkbox"
										checked={database.doneDlcs.some(
											(doneDlc) =>
												doneDlc.userVersionId === userVersion.id &&
												doneDlc.dlcId === dlc.id,
										)}
										disabled={!isEditMode}
										onChange={() =>
											handlers.toggleDoneDlc(userVersion.id, dlc.id)
										}
									/>
									{dlc.name}
								</label>
							</li>
						))}
					</ul>
					{isEditMode && (
						<button
							type="button"
							className={styles.linkButton}
							onClick={() => handlers.openAddDlcs(gameId)}
						>
							🔍 Rechercher d’autres DLC
						</button>
					)}
				</div>
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
	const isOpen =
		popover?.kind === "actionsMenu" &&
		popover.gameId === gameId &&
		popover.userVersionId === userVersionId;
	// Ligne du jeu, ou à version jouée unique : le menu du jeu ; sous-ligne : le menu de la version jouée
	const entries: {
		label: string;
		href: string | null;
		isEditOnly: boolean;
		/** Entrée inactive, avec sa raison au survol */
		unavailableReason: string | null;
		onSelect: () => void;
	}[] =
		userVersionId === null
			? [
					{
						label: "🎨 Personnaliser",
						href: null,
						isEditOnly: true,
						unavailableReason: null,
						onSelect: () => handlers.openCustomizeGame(gameId),
					},
					{
						label: "🔢 Réorganiser la série",
						href: null,
						isEditOnly: true,
						unavailableReason: hasSeries ? null : "Ce jeu n’a pas de série",
						onSelect: () => handlers.openReorderSeries(gameId),
					},
					{
						label: "✏️ Modifier le jeu",
						href: null,
						isEditOnly: true,
						unavailableReason: null,
						onSelect: () => handlers.openEditGame(gameId),
					},
					{
						label: "➕ Ajouter une version jouée",
						href: null,
						isEditOnly: true,
						unavailableReason: null,
						onSelect: () => handlers.openAddUserVersion(gameId),
					},
					{
						label: "🔗 Ouvrir sur IGDB",
						href: igdbUrl,
						isEditOnly: false,
						unavailableReason: null,
						onSelect: () => undefined,
					},
					{
						label: "🗑️ Retirer le jeu du backlog",
						href: null,
						isEditOnly: true,
						unavailableReason: null,
						onSelect: () => handlers.removeGameFromBacklog(gameId),
					},
					{
						label: "🪵 Logger cette ligne",
						href: null,
						isEditOnly: false,
						unavailableReason: null,
						onSelect: () => handlers.logRow(gameId, null),
					},
				]
			: [
					{
						label: "🔗 Ouvrir la version sur IGDB",
						href: igdbUrl,
						isEditOnly: false,
						unavailableReason: null,
						onSelect: () => undefined,
					},
					{
						label: "🗑️ Retirer la version jouée",
						href: null,
						isEditOnly: true,
						unavailableReason: null,
						onSelect: () => handlers.removeUserVersion(userVersionId),
					},
					{
						label: "🪵 Logger cette ligne",
						href: null,
						isEditOnly: false,
						unavailableReason: null,
						onSelect: () => handlers.logRow(gameId, userVersionId),
					},
				];

	return (
		<span
			className={styles.popoverAnchor}
			data-popover
		>
			<button
				type="button"
				className={styles.actionsButton}
				aria-label="Actions"
				aria-haspopup="menu"
				aria-expanded={isOpen}
				onClick={() =>
					handlers.setPopover(
						isOpen ? null : { kind: "actionsMenu", gameId, userVersionId },
					)
				}
			>
				⋮
			</button>
			{isOpen && (
				<ul
					className={styles.menu}
					role="menu"
				>
					{entries.map(
						({ label, href, isEditOnly, unavailableReason, onSelect }) => {
							const disabledTitle =
								isEditOnly && !isEditMode
									? "Disponible en mode édition"
									: unavailableReason;
							return (
								<li
									key={label}
									role="none"
								>
									{href === null ? (
										<button
											type="button"
											role="menuitem"
											disabled={disabledTitle !== null}
											title={disabledTitle ?? undefined}
											onClick={() => {
												handlers.setPopover(null);
												onSelect();
											}}
										>
											{label}
										</button>
									) : (
										<a
											role="menuitem"
											href={href}
											target="_blank"
											rel="noreferrer"
											onClick={() => handlers.setPopover(null)}
										>
											{label}
										</a>
									)}
								</li>
							);
						},
					)}
				</ul>
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

	function renderCheckbox(
		checked: boolean,
		label: string,
		toggle: (current: UserVersion) => UserVersion,
	) {
		return (
			<input
				type="checkbox"
				checked={checked}
				disabled={editableUserVersion === null}
				aria-label={label}
				onChange={() => {
					if (editableUserVersion !== null) {
						handlers.updateUserVersion(editableUserVersion.id, toggle);
					}
				}}
			/>
		);
	}

	switch (column) {
		case "status": {
			if (editableUserVersion === null) {
				return values.status === null ? null : getStatusLabel(values.status);
			}
			return (
				<select
					className={styles.cellField}
					value={editableUserVersion.status}
					aria-label="Statut"
					onChange={(event) => {
						const status = statusDefinitions.find(
							({ key }) => key === event.target.value,
						)?.key;
						if (status !== undefined) {
							handlers.changeUserVersionStatus(editableUserVersion.id, status);
						}
					}}
				>
					{/* Liste filtrée par type de fin (section 6) */}
					{statusDefinitions
						.filter(
							({ key }) =>
								key === editableUserVersion.status ||
								isStatusAllowed(key, endingType),
						)
						.map(({ key, label }) => (
							<option
								key={key}
								value={key}
							>
								{label}
							</option>
						))}
				</select>
			);
		}
		case "upNext":
			return renderCheckbox(values.isUpNext, "À jouer bientôt", (current) => ({
				...current,
				isUpNext: !current.isUpNext,
			}));
		case "owned":
			return renderCheckbox(values.isOwned, "Possédé", (current) => ({
				...current,
				isOwned: !current.isOwned,
			}));
		case "finishDate":
			if (editableUserVersion === null) {
				return values.finishDate === null
					? null
					: formatIsoDate(values.finishDate);
			}
			return (
				<DateField
					value={editableUserVersion.finishDate}
					label="Date de fin"
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
				<span className={styles.fieldGroup}>
					<NumberField
						value={editableUserVersion.sureFinishCount}
						min={0}
						max={null}
						isNullable={false}
						label="Fois fini, sûr"
						onCommit={(count) =>
							handlers.updateUserVersion(editableUserVersion.id, (current) => ({
								...current,
								sureFinishCount: count ?? 0,
							}))
						}
					/>
					+
					<NumberField
						value={editableUserVersion.probableFinishCount}
						min={0}
						max={null}
						isNullable={false}
						label="Fois fini, probable"
						onCommit={(count) =>
							handlers.updateUserVersion(editableUserVersion.id, (current) => ({
								...current,
								probableFinishCount: count ?? 0,
							}))
						}
					/>
					?
				</span>
			);
		case "dlc":
			// La ligne d'un jeu à plusieurs versions jouées affiche « faits / total » en lecture seule
			if (userVersion === null) {
				return values.dlcCount === 0
					? null
					: formatDlcProgress(values.doneDlcCount, values.dlcCount);
			}
			// Sans DLC, la cellule reste vide, sauf en mode édition pour en rechercher (section 9)
			if (values.dlcCount === 0 && !isEditMode) {
				return null;
			}
			return (
				<DlcCell
					userVersion={userVersion}
					gameId={gameId}
					label={
						values.dlcCount === 0
							? "➕"
							: formatDlcProgress(values.doneDlcCount, values.dlcCount)
					}
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
				return values.rating === null ? null : `${values.rating}/20`;
			}
			return (
				<NumberField
					value={editableUserVersion.rating}
					min={0}
					max={20}
					isNullable
					label="Note sur 20"
					onCommit={(rating) =>
						handlers.updateUserVersion(editableUserVersion.id, (current) => ({
							...current,
							rating,
						}))
					}
				/>
			);
		case "comment":
			if (editableUserVersion === null) {
				return values.comment === null ? null : (
					<span
						className={styles.comment}
						title={values.comment}
					>
						{values.comment}
					</span>
				);
			}
			return (
				<TextField
					value={editableUserVersion.comment}
					label="Commentaire"
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
	isExpanded,
	database,
	isEditMode,
	popover,
	handlers,
}: {
	row: GameRow;
	columns: ColumnKey[];
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
		// Un clic sur la série filtre le tableau sur ses jeux, aussi en lecture seule ; ✏️ : ce n'est pas celle d'IGDB
		if (column === "series") {
			const { series, proposedSeries } = row;
			return series === null ? null : (
				<>
					<button
						type="button"
						className={styles.linkButton}
						title="Filtrer sur cette série"
						onClick={() => handlers.filterOnSeries(series.name)}
					>
						{series.name}
					</button>
					{series.id !== proposedSeries?.id && (
						<span
							className={styles.help}
							title={`Série modifiée ; IGDB propose : ${proposedSeries?.name ?? "aucune"}`}
						>
							{" "}
							✏️
						</span>
					)}
				</>
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

	return (
		<>
			<tr className={row.isUpNext ? styles.upNextRow : styles.gameRow}>
				{/* Chevron et badge sur une ligne dépliable, espace vide sur une ligne simple */}
				<td className={styles.expandCell}>
					{isExpandable && (
						<>
							<button
								type="button"
								className={styles.chevron}
								aria-expanded={isExpanded}
								aria-label={isExpanded ? "Replier" : "Déplier"}
								onClick={() => handlers.toggleExpanded(row.gameId)}
							>
								{isExpanded ? "🔽" : "▶️"}
							</button>
							<span className={styles.userVersionBadge}>
								{row.userVersionRows.length} versions jouées
							</span>
						</>
					)}
				</td>
				{columns.map((column) => (
					<td key={column}>{renderGameCell(column)}</td>
				))}
			</tr>
			{isExpandable &&
				isExpanded &&
				row.userVersionRows.map((userVersionRow) => (
					<tr
						key={userVersionRow.userVersionId}
						className={styles.userVersionRow}
					>
						<td className={styles.expandCell} />
						{columns.map((column) => (
							<td key={column}>
								{renderUserVersionCell(column, userVersionRow)}
							</td>
						))}
					</tr>
				))}
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
		<span className={styles.fieldGroup}>
			<input
				ref={minRef}
				type="number"
				step="any"
				className={styles.rangeField}
				placeholder="min"
				aria-label={`${label}, minimum`}
				defaultValue={minBound === null ? "" : minBound / unit}
				onChange={update}
			/>
			–
			<input
				ref={maxRef}
				type="number"
				step="any"
				className={styles.rangeField}
				placeholder="max"
				aria-label={`${label}, maximum`}
				defaultValue={maxBound === null ? "" : maxBound / unit}
				onChange={update}
			/>
			{unit === 60 && "h"}
		</span>
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
	const fromRef = useRef<HTMLInputElement>(null);
	const toRef = useRef<HTMLInputElement>(null);

	function update() {
		const from = parseIsoDate(fromRef.current?.value ?? "");
		const to = parseIsoDate(toRef.current?.value ?? "");
		onChange(
			from === null && to === null
				? null
				: { column, kind: "dateRange", from, to },
		);
	}

	return (
		<span className={styles.fieldGroup}>
			<input
				ref={fromRef}
				type="date"
				className={styles.dateField}
				aria-label={`${label}, depuis`}
				defaultValue={filter?.from ?? ""}
				onChange={update}
			/>
			–
			<input
				ref={toRef}
				type="date"
				className={styles.dateField}
				aria-label={`${label}, jusqu’à`}
				defaultValue={filter?.to ?? ""}
				onChange={update}
			/>
		</span>
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
				<span className={styles.fieldGroup}>
					{textFilter?.isExact === true && (
						<span
							className={styles.hint}
							title="Valeur exacte, après un clic sur une série"
						>
							=
						</span>
					)}
					<input
						type="search"
						className={styles.filterField}
						placeholder="contient…"
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
				<select
					className={styles.filterField}
					aria-label={label}
					value={filter?.kind === "value" ? filter.value : ""}
					onChange={(event) =>
						onChange(
							event.target.value === ""
								? null
								: { column, kind: "value", value: event.target.value },
						)
					}
				>
					<option value="">Tous</option>
					{getFilterOptions(column, database).map((option) => (
						<option
							key={option.value}
							value={option.value}
						>
							{option.label}
						</option>
					))}
				</select>
			);
		case "boolean": {
			let selectedValue = "";
			if (filter?.kind === "boolean") {
				selectedValue = filter.value ? "oui" : "non";
			}
			return (
				<select
					className={styles.filterField}
					aria-label={label}
					value={selectedValue}
					onChange={(event) =>
						onChange(
							event.target.value === ""
								? null
								: {
										column,
										kind: "boolean",
										value: event.target.value === "oui",
									},
						)
					}
				>
					<option value="">Tous</option>
					<option value="oui">Oui</option>
					<option value="non">Non</option>
				</select>
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
}) {
	const visibleColumns = columns
		.filter(({ isVisible }) => isVisible)
		.map(({ key }) => key);
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

	return (
		<div className={styles.tableWrapper}>
			<table
				className={isEditMode ? styles.editingTable : styles.table}
				data-backlog-table
			>
				<thead>
					<tr>
						<th
							className={styles.expandCell}
							aria-label="Versions jouées"
						/>
						{visibleColumns.map((column) => (
							<ColumnHeader
								key={column}
								column={column}
								sort={sort}
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
								"🔎"
							) : (
								<button
									type="button"
									className={styles.iconButton}
									title="Retirer tous les filtres"
									onClick={clearFilters}
								>
									🧹 Effacer
								</button>
							)}
						</th>
						{visibleColumns.map((column) => (
							<th key={column}>
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
				<p className={styles.emptyMessage}>
					{filters.length > 0
						? "Aucun jeu ne correspond aux filtres."
						: "Le backlog est vide : ajoute un jeu depuis la recherche, avec une plateforme."}
				</p>
			)}
			{hasMoreRows && (
				<div
					ref={loadMoreRef}
					className={styles.emptyMessage}
				>
					⏳ Chargement…
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
	return (
		<ModalFrame
			title="Colonnes"
			isCompact
			actions={
				<button
					type="button"
					className={styles.primaryButton}
					onClick={onClose}
				>
					Fermer
				</button>
			}
		>
			<p className={styles.hint}>
				Masquer une colonne la retire aussi du tri et des filtres.
			</p>
			<ol className={styles.columnList}>
				{columns.map(({ key, isVisible }, index) => {
					const label = getColumnLabel(key);
					return (
						<li key={key}>
							<label>
								<input
									type="checkbox"
									checked={isVisible}
									disabled={key === "actions"}
									title={
										key === "actions"
											? "Toujours visible : sans elle, plus de menu"
											: undefined
									}
									onChange={() => onToggleVisibility(key)}
								/>
								{label}
							</label>
							<span className={styles.fieldGroup}>
								<button
									type="button"
									className={styles.iconButton}
									aria-label={`Monter ${label}`}
									disabled={index === 0}
									onClick={() => onMove(key, -1)}
								>
									⬆️
								</button>
								<button
									type="button"
									className={styles.iconButton}
									aria-label={`Descendre ${label}`}
									disabled={index === columns.length - 1}
									onClick={() => onMove(key, 1)}
								>
									⬇️
								</button>
							</span>
						</li>
					);
				})}
			</ol>
		</ModalFrame>
	);
}

// ---------- Footer de debug ----------

const copyLabels = {
	idle: "📋 Copier l’état",
	copied: "✅ État copié",
	failed: "❌ Copie impossible",
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
			<span>🐞 Debug</span>
			<span>
				Dernier jeu ajouté :{" "}
				{lastAddedGame
					? (lastAddedGame.frenchName ?? lastAddedGame.name)
					: "aucun"}
			</span>
			<span>
				En base — jeux : {database.games.length} · versions :{" "}
				{database.versions.length} · DLC : {database.dlcs.length}
			</span>
			<span>
				Backlog — jeux : {database.userGames.length} · versions jouées :{" "}
				{database.userVersions.length}
			</span>
			<span>
				Historique d’annulation : {undoHistoryLength} · à rétablir :{" "}
				{redoHistoryLength}
			</span>
			<span>Tri : {describeSort(state.sort)}</span>
			<span>Filtres : {describeFilters(state.filters)}</span>
			<button
				type="button"
				onClick={copyState}
			>
				{copyLabels[copyStatus]}
			</button>
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
	 * Un résultat déjà en base, ou un jeu de « 📚 Ma base », mène à l'ajout au backlog, sa version originale pré-sélectionnée
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

	// Jeux en base hors backlog, comptés sur le bouton « 📚 Ma base »
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
		<div className={styles.page}>
			<header className={styles.toolbar}>
				<h1 className={styles.title}>🎮 Backlog</h1>
				<SearchBar
					query={searchQuery}
					isOpen={isSearchOpen}
					results={searchResults}
					isSearching={isSearching}
					error={searchError}
					database={database}
					onQueryChange={changeSearchQuery}
					onOpenChange={setIsSearchOpen}
					onSelect={selectSearchResult}
				/>
				<button
					type="button"
					className={styles.button}
					title={
						databaseGameCount === 0
							? "Tous les jeux de la base sont dans le backlog"
							: "Ajouter au backlog un jeu déjà en base, sans IGDB"
					}
					disabled={databaseGameCount === 0}
					onClick={() =>
						setModal({ kind: "addFromDatabase", query: "", loadedPageCount: 1 })
					}
				>
					📚 Ma base ({databaseGameCount})
				</button>
				{/* Ctrl+Z et Ctrl+Y à la souris (section 10) */}
				<div className={styles.historyButtons}>
					<button
						type="button"
						className={styles.button}
						title="Annuler la dernière action (Ctrl+Z)"
						aria-label="Annuler la dernière action"
						disabled={undoHistory.length === 0}
						onClick={undo}
					>
						↩️
					</button>
					<button
						type="button"
						className={styles.button}
						title="Rétablir l’action annulée (Ctrl+Y)"
						aria-label="Rétablir l’action annulée"
						disabled={redoHistory.length === 0}
						onClick={redo}
					>
						↪️
					</button>
				</div>
				<button
					type="button"
					className={styles.button}
					onClick={() => setModal({ kind: "editColumns" })}
				>
					🧩 Colonnes
				</button>
				{/* Bouton fixe du mode édition : le tableau est en lecture seule par défaut (section 9) */}
				<button
					type="button"
					className={
						isEditMode ? styles.editModeButtonActive : styles.editModeButton
					}
					aria-pressed={isEditMode}
					onClick={() => setIsEditMode(!isEditMode)}
				>
					{isEditMode ? "🔒 Repasser en lecture seule" : "✏️ Passer en édition"}
				</button>
			</header>
			<main>
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
				/>
			</main>
			{modal?.kind === "addGame" && (
				<AddGameModal
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
					onMove={(key, offset) => setColumns(moveColumn(columns, key, offset))}
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
	);
}
