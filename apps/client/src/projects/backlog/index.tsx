import {
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

import styles from "./backlog.module.scss";
import { initialState } from "./initialState";
import {
	mapEditedGameImport,
	mapGameImport,
	mapGameRows,
	mapSearchResult,
	mapStoredSearchResult,
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
	type GameChoices,
	type GameImport,
	type GameRow,
	type IgdbImageId,
	type ImportSelection,
	type IsoDate,
	type Modal,
	type Platform,
	type Popover,
	type SearchResult,
	type SearchSource,
	type SortCriterion,
	type TableHandlers,
	type Variant,
	type VariantChoice,
	type VariantDraft,
	type VariantRow,
	type VariantStatus,
	variantStatusDefinitions,
	type Version,
	type VersionPlatform,
} from "./types";
import {
	addDlcs,
	addGameImport,
	addVariant,
	backlogPageSize,
	buildInitialStateFile,
	buildViewSearch,
	columnFilterKinds,
	countBacklogGames,
	defaultVariantDraft,
	describeFilters,
	describeSort,
	describeVersionPlatforms,
	editModeIdleMs,
	emptyImportSelection,
	fetchIgdbGameData,
	filterGameRows,
	findById,
	formatDlcProgress,
	formatDuration,
	formatFinishCount,
	formatIsoDate,
	formatReleaseDate,
	getColumnLabel,
	getDlcGameQueue,
	getEndingTypeLabel,
	getFilterOptions,
	getGameModal,
	getGameVariantIds,
	getIgdbImageUrl,
	getLastAddedGame,
	getNextQueuedModal,
	getNextVariantId,
	getPlatformOptions,
	getQueuedGameIds,
	getStatusLabel,
	getStoredLine,
	getTodayIsoDate,
	getVersionLabel,
	isDurationColumn,
	isFinishedStatus,
	isSortableColumn,
	isStatusAllowed,
	keepSelection,
	keepVisibleColumns,
	loadSavedColumns,
	moveColumn,
	parseIsoDate,
	pushToHistory,
	readViewFromUrl,
	receiveEditGameImport,
	receiveGameDlcs,
	receiveGameImport,
	removeVariants,
	saveColumns,
	searchDatabaseGames,
	searchDelayMs,
	searchIgdbGames,
	setColumnFilter,
	setVariantStatus,
	sortGameRows,
	toggleColumnVisibility,
	toggleId,
	toggleSort,
	toggleVariantDlc,
	trimToNull,
	updateGameChoices,
	updateVariant,
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
			<span>{platform.name}</span>
		</span>
	);
}

function Dialog({
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
				className={isCompact ? styles.compactDialog : styles.dialog}
				role="dialog"
				aria-modal="true"
				aria-label={title}
			>
				<h2 className={styles.dialogTitle}>{title}</h2>
				<div className={styles.dialogBody}>{children}</div>
				<div className={styles.dialogActions}>{actions}</div>
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

const searchSourceLabels: Record<
	SearchSource,
	{ button: string; placeholder: string }
> = {
	igdb: { button: "🌐 IGDB", placeholder: "Rechercher un jeu sur IGDB" },
	local: {
		button: "📚 Ma base",
		placeholder: "Rechercher un jeu déjà en base (sans IGDB)",
	},
};

function SearchBar({
	query,
	source,
	isOpen,
	results,
	isSearching,
	error,
	database,
	onQueryChange,
	onSourceChange,
	onOpenChange,
	onSelect,
}: {
	query: string;
	source: SearchSource;
	isOpen: boolean;
	results: SearchResult[];
	isSearching: boolean;
	error: string | null;
	database: Database;
	onQueryChange: (query: string) => void;
	onSourceChange: (source: SearchSource) => void;
	onOpenChange: (isOpen: boolean) => void;
	onSelect: (result: SearchResult) => void;
}) {
	return (
		<div
			className={styles.search}
			data-search
		>
			<div
				className={styles.searchSources}
				role="group"
				aria-label="Source de la recherche"
			>
				{(["igdb", "local"] as const).map((key) => (
					<button
						key={key}
						type="button"
						className={
							key === source ? styles.searchSourceActive : styles.searchSource
						}
						aria-pressed={key === source}
						onClick={() => onSourceChange(key)}
					>
						{searchSourceLabels[key].button}
					</button>
				))}
			</div>
			<input
				type="search"
				className={styles.searchInput}
				placeholder={`🔍 ${searchSourceLabels[source].placeholder}`}
				aria-label={searchSourceLabels[source].placeholder}
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
								{/* Sur IGDB, ce qui est déjà en base ; dans la base, ce qui est déjà dans le backlog */}
								{source === "igdb" &&
									database.versions.some(({ id }) => id === result.id) && (
										<span className={styles.inDatabaseBadge}>
											✅ déjà en base
										</span>
									)}
								{source === "local" &&
									getGameVariantIds(database, result.id).length > 0 && (
										<span className={styles.inDatabaseBadge}>
											📋 dans le backlog
										</span>
									)}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

// ---------- Modales (sections 6 et 8) ----------

/** Version puis plateforme d'une nouvelle variante : plateformes de la version, puis émulateurs de ces consoles */
function VariantChoiceFields({
	gameName,
	versions,
	versionPlatforms,
	platforms,
	variants,
	variantChoice,
	onChange,
}: {
	gameName: string;
	versions: Version[];
	versionPlatforms: VersionPlatform[];
	platforms: Platform[];
	variants: Variant[];
	variantChoice: VariantChoice;
	onChange: (variantChoice: VariantChoice) => void;
}) {
	const { versionId, platformId } = variantChoice;
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
							versionId,
							platformId:
								event.target.value === "" ? null : Number(event.target.value),
						})
					}
				>
					<option value="">— Choisir —</option>
					{platformOptions.map((platform) => {
						const isInBacklog = variants.some(
							(variant) =>
								variant.versionId === versionId &&
								variant.platformId === platform.id,
						);
						return (
							<option
								key={platform.id}
								value={platform.id}
								disabled={isInBacklog}
							>
								{`${platform.name}${platform.emulatedPlatformId === null ? "" : " (émulateur)"}${isInBacklog ? " — déjà dans le backlog" : ""}`}
							</option>
						);
					})}
				</select>
			</label>
		</div>
	);
}

/**
 * Tout ce qui est stocké, en lecture seule, et les trois choix : miniature, type de fin, n° dans la série.
 * Les versions et les DLC se cochent (`selection`) ; ce qui est déjà en base l'est d'office (section 8).
 * Un DLC peut aussi être coché « comme jeu », pour l'ajouter ensuite comme jeu à part (section 5).
 */
function GamePreview({
	gameImport,
	database,
	choices,
	selection,
	isLoadingImages,
	onChoicesChange,
	onSelectionChange,
}: {
	gameImport: GameImport;
	database: Database;
	choices: GameChoices;
	selection: ImportSelection;
	isLoadingImages: boolean;
	onChoicesChange: (choices: GameChoices) => void;
	onSelectionChange: (selection: ImportSelection) => void;
}) {
	const {
		game,
		versions,
		versionPlatforms,
		platforms,
		dlcs,
		series,
		franchise,
		developer,
		publisher,
		imageIds,
		warnings,
	} = gameImport;
	const originalVersion = versions.find(({ id }) => id === game.id);
	const endingType = endingTypeDefinitions.find(
		({ key }) => key === choices.endingType,
	);
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
								href={originalVersion.url}
								target="_blank"
								rel="noreferrer"
							>
								Ouvrir sur IGDB ↗️
							</a>
						</>
					)}
				</p>
			</section>

			<section>
				<h3>Miniature</h3>
				{isLoadingImages && <p>⏳ Chargement des images IGDB…</p>}
				{!isLoadingImages && imageIds.length === 0 && (
					<p>Aucune image sur IGDB</p>
				)}
				{!isLoadingImages && imageIds.length > 0 && (
					<div className={styles.imageChoices}>
						{imageIds.map((imageId) => (
							<button
								key={imageId}
								type="button"
								className={
									imageId === choices.imageId
										? styles.selectedImageChoice
										: styles.imageChoice
								}
								aria-pressed={imageId === choices.imageId}
								onClick={() => onChoicesChange({ ...choices, imageId })}
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
						value={choices.endingType}
						onChange={(event) =>
							onChoicesChange({
								...choices,
								endingType:
									endingTypeDefinitions.find(
										({ key }) => key === event.target.value,
									)?.key ?? choices.endingType,
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
				{series !== null && (
					<label>
						N° dans la série
						<input
							type="number"
							step="any"
							defaultValue={choices.seriesNumber ?? ""}
							onChange={(event) => {
								if (event.target.validity.valid) {
									onChoicesChange({
										...choices,
										seriesNumber:
											event.target.value === ""
												? null
												: Number(event.target.value),
									});
								}
							}}
						/>
					</label>
				)}
			</section>

			<dl className={styles.facts}>
				<dt>Série</dt>
				<dd>{series?.name ?? "—"}</dd>
				<dt>Franchise</dt>
				<dd>{franchise?.name ?? "—"}</dd>
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
											checked={selection.dlcGameIds.includes(id)}
											disabled={isGameStored}
											onChange={() =>
												onSelectionChange({
													...selection,
													dlcGameIds: toggleId(selection.dlcGameIds, id),
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
					{warnings.map(({ message, igdbData }) => (
						<details key={igdbData}>
							<summary>{message}</summary>
							<pre>{igdbData}</pre>
						</details>
					))}
				</section>
			)}
		</div>
	);
}

function DialogActions({
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

function AddGameDialog({
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
		<Dialog
			title="Ajouter un jeu"
			actions={
				<>
					<label
						className={styles.actionsOption}
						title="Après « Valider », ouvre l’ajout d’une variante : version, plateforme et tes données"
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
					<DialogActions
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
							s’ajouteront, ses choix actuels sont conservés.
						</p>
					)}
					<GamePreview
						gameImport={gameImport}
						database={database}
						choices={modal.choices}
						selection={modal.selection}
						isLoadingImages={false}
						onChoicesChange={(choices) => onModalChange({ ...modal, choices })}
						onSelectionChange={(selection) =>
							onModalChange({ ...modal, selection })
						}
					/>
				</>
			)}
		</Dialog>
	);
}

/**
 * « Modifier le jeu » (section 8) : la même modale, données de la base en lecture seule.
 * IGDB est relu à l'ouverture : ses images, et ses versions et DLC absents de la base, à cocher pour les ajouter.
 */
function EditGameDialog({
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
	const isLoadingIgdb = modal.igdbImport === null && error === null;

	return (
		<Dialog
			title="Modifier le jeu"
			actions={
				<DialogActions
					canValidate={game !== null}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
		>
			{game === null ? (
				<p>Jeu introuvable en base.</p>
			) : (
				<>
					{modal.choices.endingType !== game.endingType && (
						<p className={styles.notice}>
							ℹ️ Changer le type de fin convertit les statuts devenus
							incompatibles : Fini ↔ Estimé fini, Vu sans jouer → Pas commencé.
						</p>
					)}
					{error !== null && <p className={styles.notice}>⚠️ {error}</p>}
					{isLoadingIgdb && (
						<p className={styles.notice}>
							⏳ Chargement des versions, DLC et images IGDB absents de la base…
						</p>
					)}
					<GamePreview
						gameImport={mapEditedGameImport(database, game, modal.igdbImport)}
						database={database}
						choices={modal.choices}
						selection={modal.selection}
						isLoadingImages={isLoadingIgdb}
						onChoicesChange={(choices) => onModalChange({ ...modal, choices })}
						onSelectionChange={(selection) =>
							onModalChange({ ...modal, selection })
						}
					/>
				</>
			)}
		</Dialog>
	);
}

/** « Rechercher d'autres DLC » (section 9) : tous les DLC IGDB du jeu ; ceux déjà en base sont cochés d'office, les autres s'ajoutent au jeu */
function AddDlcsDialog({
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
		<Dialog
			title={`Autres DLC : ${game === null ? "jeu introuvable" : (game.frenchName ?? game.name)}`}
			actions={
				<DialogActions
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
						DLC de toutes ses variantes.
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
		</Dialog>
	);
}

/* eslint-disable jsx-a11y/label-has-associated-control -- les champs maison (DateField, NumberField…) rendent leur <input> dans le <label> */
/** Données du joueur de la nouvelle variante, saisies comme dans le tableau ; les règles du statut s'appliquent à « Valider » (section 6) */
function VariantDraftFields({
	draft,
	endingType,
	dlcs,
	onChange,
}: {
	draft: VariantDraft;
	endingType: EndingType;
	dlcs: Dlc[];
	onChange: (draft: VariantDraft) => void;
}) {
	return (
		<>
			<div className={styles.choiceRow}>
				<label>
					Statut
					<select
						value={draft.status}
						onChange={(event) => {
							const status = variantStatusDefinitions.find(
								({ key }) => key === event.target.value,
							)?.key;
							if (status !== undefined) {
								onChange({ ...draft, status });
							}
						}}
					>
						{/* Liste filtrée par type de fin (section 6) */}
						{variantStatusDefinitions
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
						checked={draft.playSoon}
						onChange={() => onChange({ ...draft, playSoon: !draft.playSoon })}
					/>
					À jouer bientôt
				</label>
				<label>
					<input
						type="checkbox"
						checked={draft.owned}
						onChange={() => onChange({ ...draft, owned: !draft.owned })}
					/>
					Possédé
				</label>
			</div>
			<div className={styles.choiceRow}>
				<label>
					Temps réel
					<DurationField
						minutes={draft.trackedPlayTimeMinutes}
						label="Temps réel"
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

/** « Ajouter une variante » (section 8) : version, plateforme, puis les données du joueur, toutes optionnelles */
function AddVariantDialog({
	modal,
	database,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "addVariant" }>;
	database: Database;
	onModalChange: (modal: Extract<Modal, { kind: "addVariant" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	const game = findById(database.games, modal.gameId);
	const { versionId, platformId } = modal.variantChoice;
	const isInBacklog = getGameVariantIds(database, modal.gameId).length > 0;
	const canValidate =
		versionId !== null &&
		platformId !== null &&
		!database.variants.some(
			(variant) =>
				variant.versionId === versionId && variant.platformId === platformId,
		);

	return (
		<Dialog
			title={`Ajouter une variante : ${game === null ? "jeu introuvable" : (game.frenchName ?? game.name)}`}
			actions={
				<DialogActions
					canValidate={canValidate}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
		>
			<p className={styles.notice}>
				ℹ️ Choisis la version jouée, puis la plateforme.
				{!isInBacklog && " Annuler laisse le jeu en base, hors du backlog."}
			</p>
			<VariantChoiceFields
				gameName={game?.name ?? ""}
				versions={database.versions.filter(
					({ gameId }) => gameId === modal.gameId,
				)}
				versionPlatforms={database.versionPlatforms}
				platforms={database.platforms}
				variants={database.variants}
				variantChoice={modal.variantChoice}
				onChange={(variantChoice) => onModalChange({ ...modal, variantChoice })}
			/>
			{game !== null && (
				<section className={styles.backlogOption}>
					<h3>Mes données (optionnel)</h3>
					<VariantDraftFields
						draft={modal.draft}
						endingType={game.endingType}
						dlcs={database.dlcs.filter(({ gameId }) => gameId === game.id)}
						onChange={(draft) => onModalChange({ ...modal, draft })}
					/>
				</section>
			)}
		</Dialog>
	);
}

/** Proposée au passage d'une variante au rang 5 ou plus sans date de fin (section 6) */
function FinishDateDialog({
	modal,
	database,
	onModalChange,
	onCancel,
	onValidate,
}: {
	modal: Extract<Modal, { kind: "finishDate" }>;
	database: Database;
	onModalChange: (modal: Extract<Modal, { kind: "finishDate" }>) => void;
	onCancel: () => void;
	onValidate: () => void;
}) {
	const variant = findById(database.variants, modal.variantId);
	const version =
		variant === null ? null : findById(database.versions, variant.versionId);
	const game =
		version === null ? null : findById(database.games, version.gameId);
	const platform =
		variant === null ? null : findById(database.platforms, variant.platformId);

	return (
		<Dialog
			title="Date de fin"
			isCompact
			actions={
				<DialogActions
					cancelLabel="Plus tard"
					canValidate={variant !== null}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
			}
		>
			<p>
				🏁 {game === null ? "Ce jeu" : (game.frenchName ?? game.name)}
				{platform === null ? "" : ` sur ${platform.name}`} : quand l’as-tu fini
				pour la première fois ?
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
		</Dialog>
	);
}

// ---------- Tableau (sections 5, 7 et 9) ----------

/** Bulles explicatives des en-têtes : la signification des valeurs */
const columnHelp: Partial<Record<ColumnKey, string>> = {
	endingType: endingTypeDefinitions
		.map(({ label, meaning }) => `${label} : ${meaning}`)
		.join("\n"),
	status: variantStatusDefinitions
		.map(({ rank, label, meaning }) => `${rank ?? "–"} · ${label} : ${meaning}`)
		.join("\n"),
};

/** Colonnes propres au jeu, toujours en lecture seule */
const gameInfoRenderers: Partial<
	Record<ColumnKey, (row: GameRow) => ReactNode>
> = {
	thumbnail: (row) => <Thumbnail imageId={row.imageId} />,
	// Nom VF, nom VO en dessous s'il diffère ; ligne à variante unique : titre de sa version
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
	series: (row) => row.series?.name,
	seriesNumber: (row) => row.seriesNumber,
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
const variantInfoRenderers: Partial<
	Record<ColumnKey, (row: VariantRow) => ReactNode>
> = {
	thumbnail: (row) => <Thumbnail imageId={row.imageId} />,
	name: (row) => (
		<span className={styles.versionTitle}>
			{row.versionTitle ?? "Version originale"}
		</span>
	),
	series: () => null,
	seriesNumber: () => null,
	franchise: () => null,
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
	variant,
	gameId,
	label,
	database,
	isEditMode,
	popover,
	handlers,
}: {
	variant: Variant;
	gameId: number;
	label: string;
	database: Database;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
}) {
	const isOpen = popover?.kind === "dlc" && popover.variantId === variant.id;
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
						isOpen ? null : { kind: "dlc", variantId: variant.id },
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
										checked={database.variantDlcs.some(
											(variantDlc) =>
												variantDlc.variantId === variant.id &&
												variantDlc.dlcId === dlc.id,
										)}
										disabled={!isEditMode}
										onChange={() =>
											handlers.toggleVariantDlc(variant.id, dlc.id)
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
	variantId,
	igdbUrl,
	isEditMode,
	popover,
	handlers,
}: {
	gameId: number;
	variantId: number | null;
	igdbUrl: string;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
}) {
	const isOpen =
		popover?.kind === "actionsMenu" &&
		popover.gameId === gameId &&
		popover.variantId === variantId;
	// Ligne du jeu, ou à variante unique : le menu du jeu ; sous-ligne : le menu de la variante
	const entries: {
		label: string;
		href: string | null;
		isEditOnly: boolean;
		onSelect: () => void;
	}[] =
		variantId === null
			? [
					{
						label: "✏️ Modifier le jeu",
						href: null,
						isEditOnly: true,
						onSelect: () => handlers.openEditGame(gameId),
					},
					{
						label: "➕ Ajouter une variante",
						href: null,
						isEditOnly: true,
						onSelect: () => handlers.openAddVariant(gameId),
					},
					{
						label: "🔗 Ouvrir sur IGDB",
						href: igdbUrl,
						isEditOnly: false,
						onSelect: () => undefined,
					},
					{
						label: "🗑️ Retirer le jeu du backlog",
						href: null,
						isEditOnly: true,
						onSelect: () => handlers.removeGameFromBacklog(gameId),
					},
					{
						label: "🪵 Logger cette ligne",
						href: null,
						isEditOnly: false,
						onSelect: () => handlers.logLine(gameId, null),
					},
				]
			: [
					{
						label: "🔗 Ouvrir la version sur IGDB",
						href: igdbUrl,
						isEditOnly: false,
						onSelect: () => undefined,
					},
					{
						label: "🗑️ Retirer la variante",
						href: null,
						isEditOnly: true,
						onSelect: () => handlers.removeVariant(variantId),
					},
					{
						label: "🪵 Logger cette ligne",
						href: null,
						isEditOnly: false,
						onSelect: () => handlers.logLine(gameId, variantId),
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
						isOpen ? null : { kind: "actionsMenu", gameId, variantId },
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
					{entries.map(({ label, href, isEditOnly, onSelect }) => (
						<li
							key={label}
							role="none"
						>
							{href === null ? (
								<button
									type="button"
									role="menuitem"
									disabled={isEditOnly && !isEditMode}
									title={
										isEditOnly && !isEditMode
											? "Disponible en mode édition"
											: undefined
									}
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
					))}
				</ul>
			)}
		</span>
	);
}

/**
 * Colonnes des données de l'utilisateur (section 7). Ligne du jeu à plusieurs variantes : agrégats en lecture seule.
 * Sous-ligne ou ligne à variante unique : les valeurs de la variante, modifiables en mode édition.
 */
function VariantDataCell({
	column,
	values,
	variant,
	gameId,
	endingType,
	database,
	isEditMode,
	popover,
	handlers,
}: {
	column: ColumnKey;
	values: GameRow | VariantRow;
	variant: Variant | null;
	gameId: number;
	endingType: EndingType;
	database: Database;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
}) {
	const editableVariant = isEditMode ? variant : null;

	function renderCheckbox(
		checked: boolean,
		label: string,
		toggle: (current: Variant) => Variant,
	) {
		return (
			<input
				type="checkbox"
				checked={checked}
				disabled={editableVariant === null}
				aria-label={label}
				onChange={() => {
					if (editableVariant !== null) {
						handlers.updateVariant(editableVariant.id, toggle);
					}
				}}
			/>
		);
	}

	switch (column) {
		case "status": {
			if (editableVariant === null) {
				return values.status === null ? null : getStatusLabel(values.status);
			}
			return (
				<select
					className={styles.cellField}
					value={editableVariant.status}
					aria-label="Statut"
					onChange={(event) => {
						const status = variantStatusDefinitions.find(
							({ key }) => key === event.target.value,
						)?.key;
						if (status !== undefined) {
							handlers.changeVariantStatus(editableVariant.id, status);
						}
					}}
				>
					{/* Liste filtrée par type de fin (section 6) */}
					{variantStatusDefinitions
						.filter(
							({ key }) =>
								key === editableVariant.status ||
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
		case "playSoon":
			return renderCheckbox(values.playSoon, "À jouer bientôt", (current) => ({
				...current,
				playSoon: !current.playSoon,
			}));
		case "owned":
			return renderCheckbox(values.owned, "Possédé", (current) => ({
				...current,
				owned: !current.owned,
			}));
		case "finishDate":
			if (editableVariant === null) {
				return values.finishDate === null
					? null
					: formatIsoDate(values.finishDate);
			}
			return (
				<DateField
					value={editableVariant.finishDate}
					label="Date de fin"
					onCommit={(finishDate) =>
						handlers.updateVariant(editableVariant.id, (current) => ({
							...current,
							finishDate,
						}))
					}
				/>
			);
		case "finishCount":
			if (editableVariant === null) {
				return formatFinishCount(
					values.sureFinishCount,
					values.probableFinishCount,
				);
			}
			return (
				<span className={styles.fieldGroup}>
					<NumberField
						value={editableVariant.sureFinishCount}
						min={0}
						max={null}
						isNullable={false}
						label="Fois fini, sûr"
						onCommit={(count) =>
							handlers.updateVariant(editableVariant.id, (current) => ({
								...current,
								sureFinishCount: count ?? 0,
							}))
						}
					/>
					+
					<NumberField
						value={editableVariant.probableFinishCount}
						min={0}
						max={null}
						isNullable={false}
						label="Fois fini, probable"
						onCommit={(count) =>
							handlers.updateVariant(editableVariant.id, (current) => ({
								...current,
								probableFinishCount: count ?? 0,
							}))
						}
					/>
					?
				</span>
			);
		case "dlc":
			// La ligne d'un jeu à plusieurs variantes affiche « faits / total » en lecture seule
			if (variant === null) {
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
					variant={variant}
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
			if (editableVariant === null) {
				return formatDuration(values.trackedPlayTimeMinutes);
			}
			return (
				<DurationField
					minutes={editableVariant.trackedPlayTimeMinutes}
					label="Temps réel"
					onCommit={(minutes) =>
						handlers.updateVariant(editableVariant.id, (current) => ({
							...current,
							trackedPlayTimeMinutes: minutes,
						}))
					}
				/>
			);
		case "estimatedPlayTime":
			if (editableVariant === null) {
				return formatDuration(values.estimatedPlayTimeMinutes);
			}
			return (
				<DurationField
					minutes={editableVariant.estimatedPlayTimeMinutes}
					label="Temps estimé"
					onCommit={(minutes) =>
						handlers.updateVariant(editableVariant.id, (current) => ({
							...current,
							estimatedPlayTimeMinutes: minutes,
						}))
					}
				/>
			);
		case "totalPlayTime":
			return formatDuration(values.totalPlayTimeMinutes);
		case "rating":
			if (editableVariant === null) {
				return values.rating === null ? null : `${values.rating}/20`;
			}
			return (
				<NumberField
					value={editableVariant.rating}
					min={0}
					max={20}
					isNullable
					label="Note sur 20"
					onCommit={(rating) =>
						handlers.updateVariant(editableVariant.id, (current) => ({
							...current,
							rating,
						}))
					}
				/>
			);
		case "comment":
			if (editableVariant === null) {
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
					value={editableVariant.comment}
					label="Commentaire"
					onCommit={(comment) =>
						handlers.updateVariant(editableVariant.id, (current) => ({
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

/** Ligne du jeu, puis ses sous-lignes de variantes si elle est dépliée */
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
	const isExpandable = row.variantRows.length > 1;
	// Ligne à variante unique : ses données se modifient directement sur la ligne du jeu
	const singleVariant = isExpandable
		? null
		: findById(database.variants, row.variantRows.at(0)?.variantId ?? null);

	function renderGameCell(column: ColumnKey): ReactNode {
		const renderInfo = gameInfoRenderers[column];
		if (renderInfo !== undefined) {
			return renderInfo(row);
		}
		// Un clic sur la franchise filtre le tableau sur ses jeux, aussi en lecture seule
		if (column === "franchise") {
			const { franchise } = row;
			return franchise === null ? null : (
				<button
					type="button"
					className={styles.linkButton}
					title="Filtrer sur cette franchise"
					onClick={() => handlers.filterOnFranchise(franchise.name)}
				>
					{franchise.name}
				</button>
			);
		}
		if (column === "actions") {
			return (
				<ActionsCell
					gameId={row.gameId}
					variantId={null}
					igdbUrl={row.igdbUrl}
					isEditMode={isEditMode}
					popover={popover}
					handlers={handlers}
				/>
			);
		}
		return (
			<VariantDataCell
				column={column}
				values={row}
				variant={singleVariant}
				gameId={row.gameId}
				endingType={row.endingType}
				database={database}
				isEditMode={isEditMode}
				popover={popover}
				handlers={handlers}
			/>
		);
	}

	function renderVariantCell(
		column: ColumnKey,
		variantRow: VariantRow,
	): ReactNode {
		const renderInfo = variantInfoRenderers[column];
		if (renderInfo !== undefined) {
			return renderInfo(variantRow);
		}
		if (column === "actions") {
			return (
				<ActionsCell
					gameId={row.gameId}
					variantId={variantRow.variantId}
					igdbUrl={variantRow.igdbUrl}
					isEditMode={isEditMode}
					popover={popover}
					handlers={handlers}
				/>
			);
		}
		return (
			<VariantDataCell
				column={column}
				values={variantRow}
				variant={findById(database.variants, variantRow.variantId)}
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
			<tr className={row.playSoon ? styles.playSoonRow : styles.gameRow}>
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
							<span className={styles.variantBadge}>
								{row.variantRows.length} variantes
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
				row.variantRows.map((variantRow) => (
					<tr
						key={variantRow.variantId}
						className={styles.variantRow}
					>
						<td className={styles.expandCell} />
						{columns.map((column) => (
							<td key={column}>{renderVariantCell(column, variantRow)}</td>
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
							title="Valeur exacte, après un clic sur une franchise"
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
	onLoadNextPage: () => void;
}) {
	const visibleColumns = columns
		.filter(({ isVisible }) => isVisible)
		.map(({ key }) => key);
	const shownRows = rows.slice(0, loadedPageCount * backlogPageSize);
	const hasMoreRows = shownRows.length < rows.length;
	const loadMoreRef = useRef<HTMLDivElement>(null);

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
							aria-label="Variantes"
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
					<tr className={styles.filterRow}>
						<th
							className={styles.expandCell}
							aria-label="Filtres"
						>
							🔎
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
function ColumnsDialog({
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
		<Dialog
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
		</Dialog>
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
				Backlog — jeux : {countBacklogGames(database)} · variantes :{" "}
				{database.variants.length}
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
	const [searchSource, setSearchSource] = useState<AppState["searchSource"]>(
		initialState.searchSource,
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
		// Rien n'a changé (ex. variante déjà présente) : pas d'action
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

	/** Changer de source relance la saisie en cours sur la nouvelle source */
	function changeSearchSource(source: SearchSource) {
		setIsSearchOpen(true);
		if (source === searchSource) {
			return;
		}
		setSearchSource(source);
		setSearchResults([]);
		setSearchError(null);
		// La requête IGDB part après la temporisation : la liste affiche déjà « Recherche… »
		setIsSearching(source === "igdb" && searchQuery.trim() !== "");
	}

	/**
	 * Un résultat déjà en base mène à l'ajout d'une variante, sans requête IGDB, sa version originale pré-sélectionnée
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
	 * Enregistre le jeu ; avec « Ajouter à mon backlog », ouvre ensuite l'ajout d'une variante, action distincte (section 8).
	 * La version originale y est pré-sélectionnée si c'est la seule cochée. Les DLC cochés « comme jeu » suivent, dans l'ordre.
	 */
	function validateAddGame(addGameModal: Extract<Modal, { kind: "addGame" }>) {
		const { gameImport, choices, selection, isAddingToBacklog } = addGameModal;
		if (gameImport === null) {
			return;
		}
		const queuedGameIds = [
			...getDlcGameQueue(gameImport.dlcs, selection),
			...addGameModal.queuedGameIds,
		];
		changeDatabase((current) =>
			addGameImport(current, keepSelection(gameImport, selection), choices),
		);
		if (!isAddingToBacklog) {
			openNextQueuedModal(queuedGameIds);
			return;
		}
		setModal({
			kind: "addVariant",
			gameId: gameImport.game.id,
			variantChoice: {
				versionId:
					selection.versionIds.length === 1 ? gameImport.game.id : null,
				platformId: null,
			},
			draft: defaultVariantDraft,
			queuedGameIds,
		});
	}

	/** Comme un changement de statut dans le tableau : au rang 5 ou plus sans date de fin, la petite fenêtre la propose (section 6) */
	function validateAddVariant(
		addVariantModal: Extract<Modal, { kind: "addVariant" }>,
	) {
		const { variantChoice, draft, queuedGameIds } = addVariantModal;
		const { versionId, platformId } = variantChoice;
		if (versionId === null || platformId === null) {
			return;
		}
		const variantId = getNextVariantId(database);
		changeDatabase((current) =>
			addVariant(current, versionId, platformId, draft),
		);
		if (isFinishedStatus(draft.status) && draft.finishDate === null) {
			setModal({
				kind: "finishDate",
				variantId,
				finishDate: getTodayIsoDate(),
				queuedGameIds,
			});
		} else {
			openNextQueuedModal(queuedGameIds);
		}
	}

	/** Les trois choix, puis les versions et DLC cochés en plus, en une seule action ; les DLC cochés « comme jeu » suivent */
	function validateEditGame(
		editGameModal: Extract<Modal, { kind: "editGame" }>,
	) {
		const { gameId, choices, igdbImport, selection } = editGameModal;
		changeDatabase((current) =>
			updateGameChoices(
				igdbImport === null
					? current
					: addGameImport(
							current,
							keepSelection(igdbImport, selection),
							choices,
						),
				gameId,
				choices,
			),
		);
		openNextQueuedModal(
			igdbImport === null ? [] : getDlcGameQueue(igdbImport.dlcs, selection),
		);
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
		finishDateModal: Extract<Modal, { kind: "finishDate" }>,
	) {
		const { variantId, finishDate } = finishDateModal;
		changeDatabase((current) =>
			updateVariant(current, variantId, (variant) => ({
				...variant,
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
	function changeVariantStatus(variantId: number, status: VariantStatus) {
		const variant = findById(database.variants, variantId);
		changeDatabase((current) => setVariantStatus(current, variantId, status));
		if (
			variant !== null &&
			isFinishedStatus(status) &&
			variant.finishDate === null
		) {
			setModal({
				kind: "finishDate",
				variantId,
				finishDate: getTodayIsoDate(),
				queuedGameIds: [],
			});
		}
	}

	function openEditGame(gameId: number) {
		const game = findById(database.games, gameId);
		if (game === null) {
			return;
		}
		setModalError(null);
		setModal({
			kind: "editGame",
			gameId,
			igdbImport: null,
			selection: emptyImportSelection,
			choices: {
				imageId: game.imageId,
				endingType: game.endingType,
				seriesNumber: game.seriesNumber,
			},
		});
	}

	function logLine(gameId: number, variantId: number | null) {
		const line = getStoredLine(database, gameId, variantId);
		// eslint-disable-next-line no-console -- « Logger cette ligne » (section 9)
		console.log(`🪵 ${line.game?.name ?? `Jeu ${gameId}`}`, line);
	}

	const tableHandlers: TableHandlers = {
		toggleExpanded,
		setPopover,
		updateVariant: (variantId, update) =>
			changeDatabase((current) => updateVariant(current, variantId, update)),
		changeVariantStatus,
		toggleVariantDlc: (variantId, dlcId) =>
			changeDatabase((current) => toggleVariantDlc(current, variantId, dlcId)),
		openEditGame,
		openAddVariant: (gameId) =>
			setModal({
				kind: "addVariant",
				gameId,
				variantChoice: { versionId: null, platformId: null },
				draft: defaultVariantDraft,
				queuedGameIds: [],
			}),
		openAddDlcs: (gameId) => {
			setPopover(null);
			setModalError(null);
			setModal({ kind: "addDlcs", gameId, dlcs: null, dlcIds: [] });
		},
		removeGameFromBacklog: (gameId) =>
			changeDatabase((current) =>
				removeVariants(current, getGameVariantIds(current, gameId)),
			),
		removeVariant: (variantId) =>
			changeDatabase((current) => removeVariants(current, [variantId])),
		logLine,
		filterOnFranchise: (franchiseName) =>
			setFilters(
				setColumnFilter(filters, "franchise", {
					column: "franchise",
					kind: "text",
					text: franchiseName,
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

	const loadNextPage = useCallback(() => {
		setLoadedPageCount((count) => count + 1);
	}, []);

	// Recherche IGDB temporisée : une requête 300 ms après la dernière frappe, la précédente est annulée.
	// La recherche dans la base ne fait aucune requête : ses résultats se calculent à l'affichage.
	useEffect(() => {
		const query = searchQuery.trim();
		if (query === "" || searchSource !== "igdb") {
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
	}, [searchQuery, searchSource]);

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
		(modal?.kind === "editGame" && modal.igdbImport === null) ||
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
			.then((igdbImport) =>
				setModal((current) =>
					receiveGameDlcs(
						receiveEditGameImport(current, gameIdToReload, igdbImport),
						gameIdToReload,
						igdbImport.dlcs,
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
		searchSource,
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
					source={searchSource}
					isOpen={isSearchOpen}
					results={
						searchSource === "igdb"
							? searchResults
							: searchDatabaseGames(database, searchQuery).map((game) =>
									mapStoredSearchResult(database, game),
								)
					}
					isSearching={isSearching}
					error={searchError}
					database={database}
					onQueryChange={changeSearchQuery}
					onSourceChange={changeSearchSource}
					onOpenChange={setIsSearchOpen}
					onSelect={selectSearchResult}
				/>
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
					onClick={() => setModal({ kind: "columns" })}
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
					rows={sortGameRows(
						filterGameRows(mapGameRows(database), filters),
						sort,
					)}
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
					onLoadNextPage={loadNextPage}
				/>
			</main>
			{modal?.kind === "addGame" && (
				<AddGameDialog
					modal={modal}
					database={database}
					error={modalError}
					onModalChange={setModal}
					onCancel={closeModal}
					onValidate={() => validateAddGame(modal)}
				/>
			)}
			{modal?.kind === "editGame" && (
				<EditGameDialog
					modal={modal}
					database={database}
					error={modalError}
					onModalChange={setModal}
					onCancel={closeModal}
					onValidate={() => validateEditGame(modal)}
				/>
			)}
			{modal?.kind === "addDlcs" && (
				<AddDlcsDialog
					modal={modal}
					database={database}
					error={modalError}
					onModalChange={setModal}
					onCancel={closeModal}
					onValidate={() => validateAddDlcs(modal)}
				/>
			)}
			{modal?.kind === "addVariant" && (
				<AddVariantDialog
					modal={modal}
					database={database}
					onModalChange={setModal}
					onCancel={closeModal}
					onValidate={() => validateAddVariant(modal)}
				/>
			)}
			{modal?.kind === "columns" && (
				<ColumnsDialog
					columns={columns}
					onToggleVisibility={changeColumnVisibility}
					onMove={(key, offset) => setColumns(moveColumn(columns, key, offset))}
					onClose={closeModal}
				/>
			)}
			{modal?.kind === "finishDate" && (
				<FinishDateDialog
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
