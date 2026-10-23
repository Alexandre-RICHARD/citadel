/* eslint-disable citadel/max-one-export, no-restricted-syntax -- le cahier des charges impose 6 fichiers, dont types.ts pour tous les types */
// Types du POC Backlog : un type par future table, l'état complet (AppState) et les lignes du tableau.
// Tout est sérialisable en JSON : dates en chaînes ISO, `null` plutôt que `undefined`.

/** Date ISO, ex. "2026-10-21" */
export type IsoDate = `${number}-${number}-${number}`;

/** `image_id` d'une image IGDB : seule la référence est stockée, l'URL se construit à l'affichage */
export type IgdbImageId = string;

// ---------- Listes fermées (sections 6 et 7) ----------

/** Types de fin : ce que « fini » veut dire */
export const endingTypeDefinitions = [
	{
		key: "story",
		label: "Histoire",
		meaning: "Une fin scénarisée : générique vu",
	},
	{
		key: "runs",
		label: "Runs",
		meaning:
			"Des parties recommencées ; fini = première victoire ou fin principale",
	},
	{
		key: "sandbox",
		label: "Bac à sable",
		meaning: "Pas de fin imposée ; fini quand j'estime en avoir fait le tour",
	},
	{
		key: "multiplayer",
		label: "Multijoueur",
		meaning: "Jeu en ligne ou compétitif sans fin ; jamais vraiment fini",
	},
] as const;

export type EndingType = (typeof endingTypeDefinitions)[number]["key"];

const allEndingTypes = [
	"story",
	"runs",
	"sandbox",
	"multiplayer",
] as const satisfies readonly EndingType[];

/** Statuts d'une version jouée : rangs 1 à 8, « Abandonné » hors échelle (rang `null`). `endingTypes` : types de fin qui proposent ce statut */
export const statusDefinitions = [
	{
		key: "notStarted",
		rank: 1,
		label: "Pas commencé",
		meaning: "Dans le backlog, jamais lancé",
		endingTypes: allEndingTypes,
	},
	{
		key: "watched",
		rank: 2,
		label: "Vu sans jouer",
		meaning: "Je l'ai fait avec des amis",
		endingTypes: ["story", "runs"],
	},
	{
		key: "started",
		rank: 3,
		label: "Démarré",
		meaning: "Lancé, quelques heures de jeu",
		endingTypes: allEndingTypes,
	},
	{
		key: "wellUnderway",
		rank: 4,
		label: "Bien entamé",
		meaning: "Bonne progression, pas encore fini",
		endingTypes: allEndingTypes,
	},
	{
		key: "finished",
		rank: 5,
		label: "Fini",
		meaning: "Fin principale atteinte",
		endingTypes: ["story", "runs"],
	},
	{
		key: "deemedFinished",
		rank: 5,
		label: "Estimé fini",
		meaning: "Pas de fin officielle, mais je le considère fini",
		endingTypes: ["sandbox", "multiplayer"],
	},
	{
		key: "completed",
		rank: 6,
		label: "Complété (100 %)",
		meaning:
			"Fini, et tout le contenu fait : quêtes annexes, collectibles, fins secondaires",
		endingTypes: allEndingTypes,
	},
	{
		key: "platinum",
		rank: 7,
		label: "Platiné",
		meaning: "Fini, et tous les succès ou trophées de la plateforme obtenus",
		endingTypes: allEndingTypes,
	},
	{
		key: "completedAndPlatinum",
		rank: 8,
		label: "Complété et Platiné",
		meaning: "Les deux à la fois",
		endingTypes: allEndingTypes,
	},
	{
		key: "abandoned",
		rank: null,
		label: "Abandonné",
		meaning: "Arrêté sans intention d'y revenir",
		endingTypes: allEndingTypes,
	},
] as const satisfies readonly {
	key: string;
	rank: number | null;
	label: string;
	meaning: string;
	endingTypes: readonly EndingType[];
}[];

export type Status = (typeof statusDefinitions)[number]["key"];

/** Colonnes du tableau (section 7), dans l'ordre par défaut */
export const columnDefinitions = [
	{ key: "thumbnail", label: "Miniature" },
	{ key: "name", label: "Nom" },
	{ key: "series", label: "Série" },
	{ key: "seriesNumber", label: "N° dans la série" },
	{ key: "developer", label: "Développeur" },
	{ key: "publisher", label: "Éditeur" },
	{ key: "releaseDate", label: "Date de sortie" },
	{ key: "endingType", label: "Type de fin" },
	{ key: "platform", label: "Plateforme" },
	{ key: "status", label: "Statut" },
	{ key: "upNext", label: "À jouer bientôt" },
	{ key: "owned", label: "Possédé" },
	{ key: "finishDate", label: "Date de fin" },
	{ key: "finishCount", label: "Fois fini" },
	{ key: "dlc", label: "DLC" },
	{ key: "trackedPlayTime", label: "Temps relevé" },
	{ key: "estimatedPlayTime", label: "Temps estimé" },
	{ key: "totalPlayTime", label: "Temps total" },
	{ key: "rating", label: "Note" },
	{ key: "comment", label: "Commentaire" },
	{ key: "actions", label: "Actions" },
] as const;

export type ColumnKey = (typeof columnDefinitions)[number]["key"];

// ---------- Base globale : données IGDB, partagées (les `id` sont ceux d'IGDB, sauf mention) ----------

/**
 * Jeu : l'œuvre. Son `id` est celui de sa fiche IGDB originale,
 * qui est aussi sa version originale : le lien IGDB du jeu est celui de cette version.
 */
export type Game = {
	id: number;
	/** Nom VO (`name`) */
	name: string;
	/** Nom VF (règle dans `findFrenchName`, mappers.ts) ; `null` si introuvable ou identique au nom VO */
	frenchName: string | null;
	/** `first_release_date` ; `null` ou date future : « à venir » */
	firstReleaseDate: IsoDate | null;
	/** `game_status` = Cancelled : « annulé » */
	isCancelled: boolean;
	/** Série proposée par IGDB à l'ajout du jeu, `null` s'il n'en propose pas : ✏️ dans le tableau quand la série choisie en diffère */
	proposedSeriesId: number | null;
	developerId: number | null;
	publisherId: number | null;
};

/** Version : toute fiche IGDB rattachée au jeu (originale, édition, remaster, portage, version enrichie), à n'importe quelle profondeur */
export type Version = {
	id: number;
	gameId: number;
	/** `version_title`, sinon `name` s'il diffère du nom du jeu, sinon type et année (règle dans `getVersionTitle`, mappers.ts) ; `null` pour la version originale, qui affiche le nom du jeu */
	title: string | null;
	/** Miniature de la sous-ligne */
	coverImageId: IgdbImageId | null;
	/** « Ouvrir la version sur IGDB » */
	igdbUrl: string;
};

/** Version × plateforme : la version est sortie sur cette plateforme */
export type VersionPlatform = {
	versionId: number;
	platformId: number;
	/** Plus ancienne date de sortie sur cette plateforme, toutes régions (`release_dates`) ; `null` si inconnue */
	releaseDate: IsoDate | null;
};

/** Plateforme IGDB, ou émulateur rattaché à la console qu'il émule */
export type Platform = {
	/** id IGDB ; un émulateur, absent d'IGDB, a un id négatif */
	id: number;
	/** Nom affiché : abréviation IGDB (`abbreviation`), sinon `name` ; nom choisi à la main pour un émulateur */
	shortName: string;
	/** `slug` IGDB, ou slug choisi à la main pour un émulateur ; nomme l'icône `icons/<technicalName>.svg` */
	technicalName: string;
	/** Console émulée ; `null` pour une plateforme IGDB */
	emulatedPlatformId: number | null;
};

/** DLC ou extension (`dlcs`, `expansions`), rattaché au jeu et non à une version */
export type Dlc = {
	id: number;
	gameId: number;
	name: string;
};

/** Série (section 3) : la collection IGDB la plus large du jeu, sinon sa franchise ; ou une série créée à la main (section 8) */
export type Series = {
	/** id interne : une collection et une franchise IGDB peuvent avoir le même id */
	id: number;
	/** Nom IGDB, ou saisi pour une série créée à la main ; pas de nom VF */
	name: string;
	/** `collections` ; `null` pour une série tirée d'une franchise ou créée à la main */
	igdbCollectionId: number | null;
	/** `franchise`, sinon le premier de `franchises`, pour un jeu sans collection ; `null` sinon */
	igdbFranchiseId: number | null;
};

/** Société : développeur ou éditeur (`involved_companies` → `companies`) */
export type Company = {
	id: number;
	name: string;
	/** `company_logos` */
	logoImageId: IgdbImageId | null;
};

// ---------- Base utilisateur : le backlog (les `id` sont internes) ----------

/**
 * Jeu du backlog : le jeu et sa personnalisation, choisie à l'ajout au backlog (section 8).
 * Il n'existe qu'avec au moins une version jouée : retirer la dernière le retire. Un seul par jeu (POC sans utilisateur).
 */
export type UserGame = {
	gameId: number;
	/** Miniature, parmi la cover et les artworks IGDB */
	imageId: IgdbImageId | null;
	endingType: EndingType;
	/** Celle proposée par IGDB (`Game.proposedSeriesId`), une autre, ou aucune */
	seriesId: number | null;
	/** Décimales possibles ; `null` sans série */
	seriesNumber: number | null;
};

/**
 * Version jouée : une version sur une plateforme, unique par version + plateforme.
 * Elle porte les données de jeu de l'utilisateur ; son jeu se retrouve par sa version.
 */
export type UserVersion = {
	/** id interne, sans équivalent IGDB */
	id: number;
	versionId: number;
	platformId: number;
	status: Status;
	/** « Possédé » */
	isOwned: boolean;
	/** « À jouer bientôt » */
	isUpNext: boolean;
	/** « Date de fin » : la première fin, `null` si pas fini */
	finishDate: IsoDate | null;
	/** « Fois fini », compteur sûr */
	sureFinishCount: number;
	/** « Fois fini », compteur probable */
	probableFinishCount: number;
	/** « Temps relevé », en minutes : temps relevé sur la plateforme */
	trackedPlayTimeMinutes: number;
	/** « Temps estimé », en minutes : estimation manuelle du temps non relevé */
	estimatedPlayTimeMinutes: number;
	/** « Note », entier de 0 à 20 ; `null` si pas noté */
	rating: number | null;
	comment: string | null;
};

/** DLC fait : un DLC du jeu coché comme fait sur une version jouée */
export type DoneDlc = {
	userVersionId: number;
	dlcId: number;
};

export type Database = {
	games: Game[];
	versions: Version[];
	versionPlatforms: VersionPlatform[];
	platforms: Platform[];
	dlcs: Dlc[];
	series: Series[];
	companies: Company[];
	userGames: UserGame[];
	userVersions: UserVersion[];
	doneDlcs: DoneDlc[];
};

// ---------- Interface ----------

/** Où cherche la barre de recherche : sur IGDB, ou parmi les jeux déjà en base, sans requête IGDB (section 8) */
export type SearchSource = "igdb" | "database";

/** Résultat de recherche : un jeu de base trouvé sur IGDB, ou un jeu déjà en base */
export type SearchResult = {
	/** id IGDB de la fiche ; « déjà en base » si une version porte cet id */
	id: number;
	name: string;
	/** `null` si introuvable ou identique au nom VO : un seul nom s'affiche */
	frenchName: string | null;
	/** Fiche qui a fait trouver le jeu (édition, bundle, DLC…), affichée « via … » ; `null` s'il a été trouvé par son propre nom */
	matchedName: string | null;
	releaseYear: number | null;
	coverImageId: IgdbImageId | null;
	/** Abréviations IGDB (sinon noms) ; la liste n'en affiche que 3 */
	platformNames: string[];
};

/** Série choisie pour un jeu du backlog (section 8) */
export type SeriesChoice =
	/** Celle proposée par IGDB, ou aucune s'il n'en propose pas */
	| { kind: "proposed" }
	/** Une autre série de la base */
	| { kind: "other"; seriesId: number }
	/** Créée à « Valider » ; un nom déjà pris rejoint la série existante */
	| { kind: "new"; name: string }
	| { kind: "none" };

/** Personnalisation d'un jeu du backlog en cours de saisie : à l'ajout au backlog ou par « Personnaliser » (section 8) */
export type UserGameDraft = Omit<UserGame, "gameId" | "seriesId"> & {
	series: SeriesChoice;
};

/** Nouvelle version jouée en cours de saisie (section 8) : créée seulement quand la version et la plateforme sont choisies */
export type UserVersionDraft = Omit<
	UserVersion,
	"id" | "versionId" | "platformId"
> & {
	versionId: number | null;
	platformId: number | null;
	/** DLC du jeu cochés comme faits */
	doneDlcIds: number[];
};

/** Données IGDB chargées dans la modale d'ajout, écrites en base à « Valider » seulement */
export type GameImport = {
	/** La série proposée entre en base à « Valider » : son id n'est pas encore connu */
	game: Omit<Game, "proposedSeriesId">;
	versions: Version[];
	versionPlatforms: VersionPlatform[];
	/** Plateformes IGDB des versions, ajoutées en base si absentes */
	platforms: Platform[];
	dlcs: Dlc[];
	/** Série proposée par IGDB, sans id tant qu'elle n'est pas en base ; pour « Modifier le jeu », celle proposée à l'ajout */
	proposedSeries: Omit<Series, "id"> | null;
	developer: Company | null;
	publisher: Company | null;
	/** Images proposées pour la miniature : la cover d'abord, puis les artworks ; reprises par l'ajout au backlog qui suit */
	imageIds: IgdbImageId[];
	/** Fiches IGDB qui ne rentrent pas dans le modèle, montrées dans la modale */
	warnings: ImportWarning[];
};

/** Cases de la modale du jeu (section 8) ; ce qui est déjà en base y est coché d'office et n'en fait pas partie */
export type ImportSelection = {
	/** Versions à enregistrer ; l'originale l'est toujours */
	versionIds: number[];
	/** DLC à enregistrer */
	dlcIds: number[];
	/** DLC à ajouter ensuite comme jeux à part, qu'ils soient aussi enregistrés comme DLC ou non */
	dlcAsGameIds: number[];
};

/** Fiche IGDB hors modèle : le cas et la fiche brute (`IgdbGameData.skippedEntries`, en JSON) */
export type ImportWarning = {
	message: string;
	entryJson: string;
};

/**
 * `queuedGameIds` : DLC cochés « comme jeu », dont la modale d'ajout s'ouvrira l'un après l'autre (section 8).
 * Chaque modale de l'enchaînement passe la file à la suivante ; la fermer, même par « Annuler », ouvre le DLC suivant.
 */
export type Modal =
	/** Ajout depuis la recherche ; `gameImport` vaut `null` tant que les données IGDB ne sont pas chargées */
	| {
			kind: "addGame";
			igdbId: number;
			gameImport: GameImport | null;
			selection: ImportSelection;
			/** « Ajouter à mon backlog » : « Valider » ouvre ensuite l'ajout au backlog */
			isAddingToBacklog: boolean;
			queuedGameIds: number[];
	  }
	/** « Modifier le jeu » ; `gameImport` (versions, DLC) rechargé depuis IGDB à l'ouverture, `null` en attendant */
	| {
			kind: "editGame";
			gameId: number;
			gameImport: GameImport | null;
			/** Versions et DLC à ajouter, absents de la base */
			selection: ImportSelection;
	  }
	/** « Personnaliser » ; `imageIds` relus sur IGDB à l'ouverture, `null` en attendant */
	| {
			kind: "customizeGame";
			gameId: number;
			draft: UserGameDraft;
			imageIds: IgdbImageId[] | null;
	  }
	/**
	 * Ajout au backlog, ou « Ajouter une version jouée » pour un jeu qui y est déjà : depuis le menu, un résultat de recherche
	 * déjà en base, ou après l'ajout d'un jeu. `userGameDraft` : la personnalisation, `null` si le jeu est déjà dans le backlog ;
	 * ses `imageIds` sont relus sur IGDB, `null` en attendant.
	 */
	| {
			kind: "addUserVersion";
			gameId: number;
			draft: UserVersionDraft;
			userGameDraft: UserGameDraft | null;
			imageIds: IgdbImageId[] | null;
			queuedGameIds: number[];
	  }
	/** « Rechercher d'autres DLC » (section 9) : tous les DLC IGDB du jeu, `null` tant qu'ils ne sont pas chargés */
	| {
			kind: "addDlcs";
			gameId: number;
			dlcs: Dlc[] | null;
			/** DLC cochés, absents de la base */
			dlcIds: number[];
	  }
	/** Date de fin proposée au passage au rang 5 ou plus */
	| {
			kind: "setFinishDate";
			userVersionId: number;
			finishDate: IsoDate;
			queuedGameIds: number[];
	  }
	/** Visibilité et ordre des colonnes */
	| { kind: "editColumns" };

export type Popover =
	| { kind: "dlc"; userVersionId: number }
	/** `userVersionId` à `null` : menu de la ligne du jeu */
	| { kind: "actionsMenu"; gameId: number; userVersionId: number | null };

/** L'ordre du tableau `columns` est l'ordre d'affichage */
export type ColumnSetting = {
	key: ColumnKey;
	isVisible: boolean;
};

export type SortDirection = "asc" | "desc";

/** L'ordre du tableau `sort` donne la priorité */
export type SortCriterion = {
	column: ColumnKey;
	direction: SortDirection;
};

/** Filtre d'une colonne (section 9), un seul par colonne */
export type ColumnFilter =
	/** « contient », ou valeur exacte après un clic sur une série */
	| { column: ColumnKey; kind: "text"; text: string; isExact: boolean }
	/** Une valeur de liste : clé du type de fin ou du statut, nom de la plateforme */
	| { column: ColumnKey; kind: "value"; value: string }
	| { column: ColumnKey; kind: "boolean"; value: boolean }
	/** Bornes incluses ; les temps sont en minutes */
	| {
			column: ColumnKey;
			kind: "numberRange";
			min: number | null;
			max: number | null;
	  }
	| {
			column: ColumnKey;
			kind: "dateRange";
			from: IsoDate | null;
			to: IsoDate | null;
	  };

/** État complet : un `useState` par clé. Hors historique d'annulation et états passagers (chargement, erreur réseau, minuteurs) */
export type AppState = {
	database: Database;
	searchQuery: string;
	/** Résultats IGDB seulement : ceux de la base se recalculent à chaque affichage */
	searchResults: SearchResult[];
	searchSource: SearchSource;
	/** Liste des résultats ouverte sous la barre de recherche */
	isSearchOpen: boolean;
	modal: Modal | null;
	popover: Popover | null;
	isEditMode: boolean;
	expandedGameIds: number[];
	columns: ColumnSetting[];
	sort: SortCriterion[];
	filters: ColumnFilter[];
	/** Pages de 25 jeux affichées par le défilement infini */
	loadedPageCount: number;
};

/** Ce que le tableau peut déclencher ; toute modification de la base passe par `changeDatabase` */
export type TableHandlers = {
	toggleExpanded: (gameId: number) => void;
	setPopover: (popover: Popover | null) => void;
	updateUserVersion: (
		userVersionId: number,
		update: (userVersion: UserVersion) => UserVersion,
	) => void;
	changeUserVersionStatus: (userVersionId: number, status: Status) => void;
	toggleDoneDlc: (userVersionId: number, dlcId: number) => void;
	openCustomizeGame: (gameId: number) => void;
	openEditGame: (gameId: number) => void;
	openAddUserVersion: (gameId: number) => void;
	/** « Rechercher d'autres DLC », depuis le popover des DLC (section 9) */
	openAddDlcs: (gameId: number) => void;
	removeGameFromBacklog: (gameId: number) => void;
	removeUserVersion: (userVersionId: number) => void;
	logRow: (gameId: number, userVersionId: number | null) => void;
	/** Un clic sur un nom de série filtre le tableau sur ses jeux (section 9) */
	filterOnSeries: (seriesName: string) => void;
};

// ---------- Lignes du tableau : calculées par les mappers, jamais stockées ----------

/** Sous-ligne : une version jouée */
export type UserVersionRow = {
	userVersionId: number;
	versionId: number;
	coverImageId: IgdbImageId | null;
	/** `null` pour la version originale */
	versionTitle: string | null;
	/** Sortie de la version sur cette plateforme */
	releaseDate: IsoDate | null;
	platform: Platform;
	status: Status;
	isOwned: boolean;
	isUpNext: boolean;
	finishDate: IsoDate | null;
	sureFinishCount: number;
	probableFinishCount: number;
	doneDlcCount: number;
	dlcCount: number;
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
	totalPlayTimeMinutes: number;
	rating: number | null;
	comment: string | null;
	igdbUrl: string;
};

/** Ligne d'un jeu du backlog : données du jeu, sa personnalisation et les agrégats de ses versions jouées ; `null` quand il est impossible de choisir */
export type GameRow = {
	gameId: number;
	/** Image choisie à l'ajout au backlog */
	imageId: IgdbImageId | null;
	name: string;
	frenchName: string | null;
	/** Ligne à version jouée unique : titre de sa version, s'il ne s'agit pas de l'originale */
	versionTitle: string | null;
	series: Series | null;
	/** Série proposée par IGDB : ✏️ quand elle diffère de `series` */
	proposedSeries: Series | null;
	seriesNumber: number | null;
	developer: Company | null;
	publisher: Company | null;
	/** Date originale du jeu */
	releaseDate: IsoDate | null;
	isCancelled: boolean;
	endingType: EndingType;
	/** `null` si plusieurs versions jouées */
	platform: Platform | null;
	/** Meilleur statut (section 6) */
	status: Status | null;
	/** Au moins une version jouée */
	isOwned: boolean;
	/** Au moins une version jouée ; la ligne est mise en valeur */
	isUpNext: boolean;
	/** La plus ancienne */
	finishDate: IsoDate | null;
	sureFinishCount: number;
	probableFinishCount: number;
	/** Un DLC compte comme fait s'il l'est sur au moins une version jouée */
	doneDlcCount: number;
	dlcCount: number;
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
	totalPlayTimeMinutes: number;
	/** La plus haute */
	rating: number | null;
	/** Le commentaire s'il n'y en a qu'un */
	comment: string | null;
	igdbUrl: string;
	/** Une sous-ligne par version jouée ; la ligne est dépliable à partir de deux */
	userVersionRows: UserVersionRow[];
};

/** Index de la base, construits une fois par calcul des lignes : chaque recherche est directe, sans reparcourir la base */
export type RowIndexes = {
	games: Map<number, Game>;
	versions: Map<number, Version>;
	platforms: Map<number, Platform>;
	series: Map<number, Series>;
	companies: Map<number, Company>;
	/** Clé `${versionId}-${platformId}` */
	releaseDates: Map<string, IsoDate | null>;
	/** Clé `null` : version introuvable, la version jouée n'a pas de ligne */
	userVersionsByGameId: Map<number | null, UserVersion[]>;
	dlcIdsByGameId: Map<number, Set<number>>;
	doneDlcIdsByUserVersionId: Map<number, number[]>;
};

// ---------- Réponses IGDB : seulement les champs demandés, absents quand IGDB n'a pas de valeur ----------

/** Tailles d'image IGDB ; suffixe `_2x` pour les écrans haute densité */
export type IgdbImageSize =
	| "micro"
	| "thumb"
	| "cover_small"
	| "cover_big"
	| "logo_med"
	| "screenshot_med"
	| "screenshot_big"
	| "screenshot_huge"
	| "720p"
	| "1080p";

/** Endpoint `game_types` */
export type IgdbGameType = {
	id: number;
	type: string;
};

/** Endpoint `game_statuses` */
export type IgdbGameStatus = {
	id: number;
	status: string;
};

/** Noms des types de fiche et des statuts de sortie, par id : lus une fois via IGDB, jamais codés en dur */
export type IgdbReference = {
	gameTypes: Map<number, string>;
	gameStatuses: Map<number, string>;
};

export type IgdbAlternativeName = {
	id: number;
	name?: string;
	comment?: string;
};

/** Fiche renvoyée par la recherche, avec de quoi remonter à son jeu de base */
export type IgdbSearchGame = {
	id: number;
	name: string;
	game_type?: number;
	version_parent?: number;
	parent_game?: number;
	/** Bundles qui contiennent cette fiche */
	bundles?: number[];
	/** Timestamp Unix, en secondes */
	first_release_date?: number;
	cover?: { image_id: IgdbImageId };
	alternative_names?: IgdbAlternativeName[];
	platforms?: { name: string; abbreviation?: string }[];
};

/** Jeu de base trouvé par la recherche, et le nom de la fiche qui l'a fait trouver quand ce n'est pas la sienne */
export type IgdbSearchHit = {
	game: IgdbSearchGame;
	matchedName: string | null;
};

/** Nœud de l'arbre des versions : de quoi remonter à l'original et descendre vers ses versions */
export type IgdbGameNode = {
	id: number;
	name: string;
	game_type?: number;
	version_parent?: number;
	parent_game?: number;
	remasters?: number[];
	ports?: number[];
	expanded_games?: number[];
};

export type IgdbPlatform = {
	id: number;
	name: string;
	abbreviation?: string;
	slug: string;
};

/** Détail d'une version, originale comprise */
export type IgdbVersionGame = {
	id: number;
	name: string;
	version_title?: string;
	/** Nom du type, lu via IGDB : titre d'une version sans titre propre */
	game_type?: { type: string };
	cover?: { image_id: IgdbImageId };
	url: string;
	platforms?: IgdbPlatform[];
	/** `date` : timestamp Unix en secondes, absent si la date est inconnue */
	release_dates?: { date?: number; platform?: number }[];
	dlcs?: number[];
	expansions?: number[];
};

export type IgdbCompany = {
	id: number;
	name: string;
	logo?: { image_id: IgdbImageId };
};

/** Données propres au jeu, lues sur sa fiche originale */
export type IgdbOriginalGame = {
	id: number;
	name: string;
	alternative_names?: IgdbAlternativeName[];
	first_release_date?: number;
	game_status?: number;
	artworks?: { image_id: IgdbImageId }[];
	/** `as_child_relations` : de quoi garder la plus large (section 3) */
	collections?: {
		id: number;
		name: string;
		as_child_relations?: { parent_collection?: number }[];
	}[];
	franchise?: { id: number; name: string };
	franchises?: { id: number; name: string }[];
	involved_companies?: {
		developer: boolean;
		publisher: boolean;
		company: IgdbCompany;
	}[];
};

/** Images d'un jeu, relues à l'ajout au backlog et par « Personnaliser » */
export type IgdbGameImages = {
	id: number;
	cover?: { image_id: IgdbImageId };
	artworks?: { image_id: IgdbImageId }[];
};

export type IgdbDlcGame = {
	id: number;
	name: string;
	game_type?: number;
};

/** Tout ce qu'IGDB renvoie pour un jeu à l'ouverture de la modale d'ajout */
export type IgdbGameData = {
	original: IgdbOriginalGame;
	/** Toutes les versions, originale comprise */
	versions: IgdbVersionGame[];
	/** DLC et extensions de l'original et de toutes ses versions, sans packs ni mises à jour */
	dlcs: IgdbDlcGame[];
	/** Nom du `game_status` de l'original (ex. « Cancelled ») */
	gameStatus: string | null;
	/** Fiches rattachées comme versions mais d'un autre type (bundle…), donc ignorées */
	skippedEntries: { message: string; entry: IgdbGameNode }[];
};
