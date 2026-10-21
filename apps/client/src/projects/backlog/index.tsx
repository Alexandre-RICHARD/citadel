import { type ReactNode, useEffect, useState } from "react";

import styles from "./backlog.module.scss";
import { initialState } from "./initialState";
import { mapGameImport, mapSearchResult } from "./mappers";
import {
	type AppState,
	type Company,
	type Database,
	endingTypeDefinitions,
	type GameChoices,
	type GameImport,
	type IgdbImageId,
	type Modal,
	type Platform,
	type SearchResult,
	type Variant,
	type VariantChoice,
	type Version,
	type VersionPlatform,
} from "./types";
import {
	addGameImport,
	addVariant,
	buildInitialStateFile,
	countBacklogGames,
	describeFilters,
	describeSort,
	describeVersionPlatforms,
	fetchIgdbGameData,
	formatReleaseDate,
	getIgdbImageUrl,
	getLastAddedGame,
	getPlatformOptions,
	getVersionLabel,
	mergeById,
	receiveGameImport,
	searchDelayMs,
	searchIgdbGames,
} from "./utils";

// ---------- Petits composants ----------

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

function Dialog({
	title,
	actions,
	children,
}: {
	title: string;
	actions: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className={styles.overlay}>
			<div
				className={styles.dialog}
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

// ---------- Recherche ----------

function SearchBar({
	query,
	results,
	isSearching,
	error,
	database,
	onQueryChange,
	onSelect,
}: {
	query: string;
	results: SearchResult[];
	isSearching: boolean;
	error: string | null;
	database: Database;
	onQueryChange: (query: string) => void;
	onSelect: (result: SearchResult) => void;
}) {
	return (
		<div className={styles.search}>
			<input
				type="search"
				className={styles.searchInput}
				placeholder="🔍 Rechercher un jeu sur IGDB"
				aria-label="Rechercher un jeu sur IGDB"
				value={query}
				onChange={(event) => onQueryChange(event.target.value)}
			/>
			{query.trim() !== "" && (
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
								</span>
								{database.versions.some(({ id }) => id === result.id) && (
									<span className={styles.inDatabaseBadge}>
										✅ déjà en base
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

// ---------- Modales (section 8) ----------

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

/** Tout ce qui sera stocké, en lecture seule, et les trois choix : miniature, type de fin, n° dans la série */
function GamePreview({
	gameImport,
	choices,
	onChoicesChange,
}: {
	gameImport: GameImport;
	choices: GameChoices;
	onChoicesChange: (choices: GameChoices) => void;
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
		alternativeNames,
		imageIds,
		warnings,
	} = gameImport;
	const originalVersion = versions.find(({ id }) => id === game.id);
	const endingType = endingTypeDefinitions.find(
		({ key }) => key === choices.endingType,
	);

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
				{imageIds.length === 0 ? (
					<p>Aucune image sur IGDB</p>
				) : (
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
				<dt>Noms alternatifs</dt>
				<dd>
					{alternativeNames.length === 0 ? (
						"—"
					) : (
						<ul>
							{alternativeNames.map(({ id, name, comment }) => (
								<li key={id}>
									{name}
									{comment !== null && (
										<span className={styles.hint}> ({comment})</span>
									)}
								</li>
							))}
						</ul>
					)}
				</dd>
			</dl>

			<section>
				<h3>Versions ({versions.length})</h3>
				<ul>
					{versions.map((version) => (
						<li key={version.id}>
							<strong>{version.title ?? `${game.name} (originale)`}</strong>
							<span className={styles.hint}>
								{" "}
								{describeVersionPlatforms(
									version.id,
									versionPlatforms,
									platforms,
								)}
							</span>
						</li>
					))}
				</ul>
			</section>

			<section>
				<h3>DLC ({dlcs.length})</h3>
				{dlcs.length === 0 ? (
					<p>Aucun DLC</p>
				) : (
					<ul>
						{dlcs.map(({ id, name }) => (
							<li key={id}>{name}</li>
						))}
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
					<button
						type="button"
						className={styles.button}
						onClick={onCancel}
					>
						Annuler
					</button>
					<button
						type="button"
						className={styles.primaryButton}
						disabled={gameImport === null}
						onClick={onValidate}
					>
						Valider
					</button>
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
						choices={modal.choices}
						onChoicesChange={(choices) => onModalChange({ ...modal, choices })}
					/>
					<section className={styles.backlogOption}>
						<h3>Ajouter au backlog (optionnel)</h3>
						<VariantChoiceFields
							gameName={gameImport.game.name}
							versions={gameImport.versions}
							versionPlatforms={gameImport.versionPlatforms}
							platforms={mergeById(gameImport.platforms, database.platforms)}
							variants={database.variants}
							variantChoice={modal.variantChoice}
							onChange={(variantChoice) =>
								onModalChange({ ...modal, variantChoice })
							}
						/>
						<p className={styles.hint}>
							Sans plateforme, le jeu entre en base sans entrer dans le backlog.
						</p>
					</section>
				</>
			)}
		</Dialog>
	);
}

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
	const game = database.games.find(({ id }) => id === modal.gameId);
	const { versionId, platformId } = modal.variantChoice;
	const canValidate =
		versionId !== null &&
		platformId !== null &&
		!database.variants.some(
			(variant) =>
				variant.versionId === versionId && variant.platformId === platformId,
		);

	return (
		<Dialog
			title={`Ajouter une variante : ${game === undefined ? "jeu introuvable" : (game.frenchName ?? game.name)}`}
			actions={
				<>
					<button
						type="button"
						className={styles.button}
						onClick={onCancel}
					>
						Annuler
					</button>
					<button
						type="button"
						className={styles.primaryButton}
						disabled={!canValidate}
						onClick={onValidate}
					>
						Valider
					</button>
				</>
			}
		>
			<p className={styles.notice}>
				ℹ️ Ce jeu est déjà en base : choisis la version jouée, puis la
				plateforme.
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
}: {
	state: AppState;
	undoHistoryLength: number;
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
			<span>Historique d’annulation : {undoHistoryLength}</span>
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

export function Backlog() {
	// Un useState par clé de initialState ; chaque setter arrive avec la phase qui s'en sert
	const [database, setDatabase] = useState<AppState["database"]>(
		initialState.database,
	);
	const [searchQuery, setSearchQuery] = useState<AppState["searchQuery"]>(
		initialState.searchQuery,
	);
	const [searchResults, setSearchResults] = useState<AppState["searchResults"]>(
		initialState.searchResults,
	);
	const [modal, setModal] = useState<AppState["modal"]>(initialState.modal);
	const [popover] = useState<AppState["popover"]>(initialState.popover);
	const [isEditMode] = useState<AppState["isEditMode"]>(
		initialState.isEditMode,
	);
	const [expandedGameIds] = useState<AppState["expandedGameIds"]>(
		initialState.expandedGameIds,
	);
	const [columns] = useState<AppState["columns"]>(initialState.columns);
	const [sort] = useState<AppState["sort"]>(initialState.sort);
	const [filters] = useState<AppState["filters"]>(initialState.filters);
	const [loadedPageCount] = useState<AppState["loadedPageCount"]>(
		initialState.loadedPageCount,
	);

	// États passagers, hors AppState : historique d'annulation (rempli en phase 7), recherche et modale en cours
	const [undoHistory] = useState<Database[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [modalError, setModalError] = useState<string | null>(null);

	// Seule fonction qui modifie la base : l'annuler / rétablir (phase 7) s'y branchera
	function changeDatabase(change: (current: Database) => Database) {
		setDatabase(change(database));
	}

	function changeSearchQuery(query: string) {
		setSearchQuery(query);
		if (query.trim() === "") {
			setSearchResults([]);
			setIsSearching(false);
			setSearchError(null);
		}
	}

	/** Un résultat déjà en base mène à l'ajout d'une variante, sinon à la modale d'ajout ; la fiche choisie est la version pré-sélectionnée */
	function selectSearchResult(result: SearchResult) {
		const version = database.versions.find(({ id }) => id === result.id);
		setModalError(null);
		setModal(
			version === undefined
				? {
						kind: "addGame",
						igdbId: result.id,
						gameImport: null,
						choices: { imageId: null, endingType: "story", seriesNumber: null },
						variantChoice: { versionId: result.id, platformId: null },
					}
				: {
						kind: "addVariant",
						gameId: version.gameId,
						variantChoice: { versionId: version.id, platformId: null },
					},
		);
	}

	function closeModal() {
		setModal(null);
	}

	function validateAddGame(addGameModal: Extract<Modal, { kind: "addGame" }>) {
		const { gameImport, choices, variantChoice } = addGameModal;
		if (gameImport === null) {
			return;
		}
		changeDatabase((current) =>
			addGameImport(current, gameImport, choices, variantChoice),
		);
		closeModal();
	}

	function validateAddVariant(
		addVariantModal: Extract<Modal, { kind: "addVariant" }>,
	) {
		const { versionId, platformId } = addVariantModal.variantChoice;
		if (versionId === null || platformId === null) {
			return;
		}
		changeDatabase((current) => addVariant(current, versionId, platformId));
		closeModal();
	}

	// Recherche temporisée : une requête 300 ms après la dernière frappe, la précédente est annulée
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
				.then((games) => setSearchResults(games.map(mapSearchResult)))
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

	// Échap ferme la modale ; rien n'est enregistré avant « Valider »
	const isModalOpen = modal !== null;
	useEffect(() => {
		if (!isModalOpen) {
			return undefined;
		}
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setModal(null);
			}
		}
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [isModalOpen]);

	// Même ordre de clés que AppState et initialState : l'export reste comparable au fichier collé
	const state: AppState = {
		database,
		searchQuery,
		searchResults,
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
				<SearchBar
					query={searchQuery}
					results={searchResults}
					isSearching={isSearching}
					error={searchError}
					database={database}
					onQueryChange={changeSearchQuery}
					onSelect={selectSearchResult}
				/>
			</header>
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
			{modal?.kind === "addVariant" && (
				<AddVariantDialog
					modal={modal}
					database={database}
					onModalChange={setModal}
					onCancel={closeModal}
					onValidate={() => validateAddVariant(modal)}
				/>
			)}
			<DebugFooter
				state={state}
				undoHistoryLength={undoHistory.length}
			/>
		</div>
	);
}
