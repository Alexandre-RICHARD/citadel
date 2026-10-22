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
	mapGameImport,
	mapGameRows,
	mapSearchResult,
	mapStoredGameImport,
} from "./mappers";
import {
	type AppState,
	type ColumnKey,
	type ColumnSetting,
	type Company,
	type Database,
	type EndingType,
	endingTypeDefinitions,
	type GameChoices,
	type GameImport,
	type GameRow,
	type IgdbImageId,
	type IsoDate,
	type Modal,
	type Platform,
	type Popover,
	type SearchResult,
	type TableHandlers,
	type Variant,
	type VariantChoice,
	type VariantRow,
	type VariantStatus,
	variantStatusDefinitions,
	type Version,
	type VersionPlatform,
} from "./types";
import {
	addGameImport,
	addVariant,
	backlogPageSize,
	buildInitialStateFile,
	countBacklogGames,
	describeFilters,
	describeSort,
	describeVersionPlatforms,
	editModeIdleMs,
	fetchIgdbGameData,
	fetchIgdbGameImages,
	findById,
	formatDlcProgress,
	formatDuration,
	formatFinishCount,
	formatIsoDate,
	formatReleaseDate,
	getColumnLabel,
	getEndingTypeLabel,
	getGameVariantIds,
	getIgdbImageUrl,
	getLastAddedGame,
	getPlatformOptions,
	getStatusLabel,
	getStoredLine,
	getTodayIsoDate,
	getVersionLabel,
	isFinishedStatus,
	isStatusAllowed,
	mergeById,
	parseIsoDate,
	receiveGameImages,
	receiveGameImport,
	removeVariants,
	searchDelayMs,
	searchIgdbGames,
	setVariantStatus,
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
									{/* 3 plateformes au plus, puis le nombre restant */}
									{result.platformNames.length > 0 && (
										<span className={styles.originalName}>
											{` · ${result.platformNames.slice(0, 3).join(", ")}`}
											{result.platformNames.length > 3 &&
												` +${result.platformNames.length - 3}`}
										</span>
									)}
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

/** Tout ce qui est stocké, en lecture seule, et les trois choix : miniature, type de fin, n° dans la série */
function GamePreview({
	gameImport,
	choices,
	isLoadingImages,
	onChoicesChange,
}: {
	gameImport: GameImport;
	choices: GameChoices;
	isLoadingImages: boolean;
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
				<DialogActions
					canValidate={gameImport !== null}
					onCancel={onCancel}
					onValidate={onValidate}
				/>
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
						isLoadingImages={false}
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

/** « Modifier le jeu » (section 8) : la même modale, données de la base en lecture seule, images rechargées depuis IGDB */
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
	// Tant que les images ne sont pas rechargées (ou si IGDB échoue), l'image actuelle reste proposée
	const currentImageIds =
		game?.imageId === undefined || game.imageId === null ? [] : [game.imageId];

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
					<GamePreview
						gameImport={mapStoredGameImport(
							database,
							game,
							modal.imageIds ?? currentImageIds,
						)}
						choices={modal.choices}
						isLoadingImages={modal.imageIds === null && error === null}
						onChoicesChange={(choices) => onModalChange({ ...modal, choices })}
					/>
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
	const game = findById(database.games, modal.gameId);
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
	franchise: (row) => row.franchise?.name,
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

function ColumnHeader({ column }: { column: ColumnKey }) {
	const help = columnHelp[column];
	return (
		<th scope="col">
			{getColumnLabel(column)}
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

/** « faits / total » ; un clic ouvre la liste des DLC du jeu, à cocher en mode édition (section 9) */
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
			if (values.dlcCount === 0) {
				return null;
			}
			// La ligne d'un jeu à plusieurs variantes affiche « faits / total » en lecture seule
			if (variant === null) {
				return formatDlcProgress(values.doneDlcCount, values.dlcCount);
			}
			return (
				<DlcCell
					variant={variant}
					gameId={gameId}
					label={formatDlcProgress(values.doneDlcCount, values.dlcCount)}
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

function BacklogTable({
	rows,
	columns,
	expandedGameIds,
	loadedPageCount,
	database,
	isEditMode,
	popover,
	handlers,
	onLoadNextPage,
}: {
	rows: GameRow[];
	columns: ColumnSetting[];
	expandedGameIds: number[];
	loadedPageCount: number;
	database: Database;
	isEditMode: boolean;
	popover: Popover | null;
	handlers: TableHandlers;
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
							/>
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
					Le backlog est vide : ajoute un jeu depuis la recherche, avec une
					plateforme.
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

/** Toute action de l'utilisateur relance le minuteur d'inactivité du mode édition */
const activityEvents = [
	"pointerdown",
	"pointermove",
	"keydown",
	"wheel",
	"scroll",
	"touchstart",
] as const;

/** Une cellule est en cours d'édition quand le focus est dans un de ses champs de saisie */
function isEditingCell(): boolean {
	const element = document.activeElement;
	return (
		element instanceof HTMLInputElement &&
		["text", "number", "date"].includes(element.type) &&
		element.closest("[data-backlog-table]") !== null
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
	const [columns] = useState<AppState["columns"]>(initialState.columns);
	const [sort] = useState<AppState["sort"]>(initialState.sort);
	const [filters] = useState<AppState["filters"]>(initialState.filters);
	const [loadedPageCount, setLoadedPageCount] = useState<
		AppState["loadedPageCount"]
	>(initialState.loadedPageCount);

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

	function validateEditGame(
		editGameModal: Extract<Modal, { kind: "editGame" }>,
	) {
		const { gameId, choices } = editGameModal;
		changeDatabase((current) => updateGameChoices(current, gameId, choices));
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
			imageIds: null,
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
			}),
		removeGameFromBacklog: (gameId) =>
			changeDatabase((current) =>
				removeVariants(current, getGameVariantIds(current, gameId)),
			),
		removeVariant: (variantId) =>
			changeDatabase((current) => removeVariants(current, [variantId])),
		logLine,
	};

	const loadNextPage = useCallback(() => {
		setLoadedPageCount((count) => count + 1);
	}, []);

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

	// « Modifier le jeu » : la cover et les artworks sont rechargés depuis IGDB à l'ouverture (section 8)
	const gameIdToLoadImages =
		modal?.kind === "editGame" && modal.imageIds === null ? modal.gameId : null;
	useEffect(() => {
		if (gameIdToLoadImages === null) {
			return undefined;
		}
		const controller = new AbortController();
		fetchIgdbGameImages(gameIdToLoadImages, controller.signal)
			.then((imageIds) =>
				setModal((current) =>
					receiveGameImages(current, gameIdToLoadImages, imageIds),
				),
			)
			.catch((error: unknown) => {
				if (!controller.signal.aborted) {
					setModalError(error instanceof Error ? error.message : String(error));
				}
			});
		return () => controller.abort();
	}, [gameIdToLoadImages]);

	// Échap ferme le popover ouvert, sinon la modale ; rien n'est enregistré avant « Valider »
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
				setModal(null);
			}
		}
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [isModalOpen, isPopoverOpen]);

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
				<h1 className={styles.title}>🎮 Backlog</h1>
				<SearchBar
					query={searchQuery}
					results={searchResults}
					isSearching={isSearching}
					error={searchError}
					database={database}
					onQueryChange={changeSearchQuery}
					onSelect={selectSearchResult}
				/>
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
					rows={mapGameRows(database)}
					columns={columns}
					expandedGameIds={expandedGameIds}
					loadedPageCount={loadedPageCount}
					database={database}
					isEditMode={isEditMode}
					popover={popover}
					handlers={tableHandlers}
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
			{modal?.kind === "addVariant" && (
				<AddVariantDialog
					modal={modal}
					database={database}
					onModalChange={setModal}
					onCancel={closeModal}
					onValidate={() => validateAddVariant(modal)}
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
			/>
		</div>
	);
}
