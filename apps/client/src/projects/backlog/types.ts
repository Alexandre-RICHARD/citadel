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

/** Statuts d'une variante : rangs 1 à 8, « Abandonné » hors échelle (rang `null`). `endingTypes` : types de fin qui proposent ce statut */
export const variantStatusDefinitions = [
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

export type VariantStatus = (typeof variantStatusDefinitions)[number]["key"];

/** Colonnes du tableau (section 7), dans l'ordre par défaut */
export const columnDefinitions = [
	{ key: "thumbnail", label: "Miniature" },
	{ key: "name", label: "Nom" },
	{ key: "series", label: "Série" },
	{ key: "seriesNumber", label: "N° dans la série" },
	{ key: "franchise", label: "Franchise" },
	{ key: "developer", label: "Développeur" },
	{ key: "publisher", label: "Éditeur" },
	{ key: "releaseDate", label: "Date de sortie" },
	{ key: "endingType", label: "Type de fin" },
	{ key: "platform", label: "Plateforme" },
	{ key: "status", label: "Statut" },
	{ key: "playSoon", label: "À jouer bientôt" },
	{ key: "owned", label: "Possédé" },
	{ key: "finishDate", label: "Date de fin" },
	{ key: "finishCount", label: "Fois fini" },
	{ key: "dlc", label: "DLC" },
	{ key: "trackedPlayTime", label: "Temps réel" },
	{ key: "estimatedPlayTime", label: "Temps estimé" },
	{ key: "totalPlayTime", label: "Temps total" },
	{ key: "rating", label: "Note" },
	{ key: "comment", label: "Commentaire" },
	{ key: "actions", label: "Actions" },
] as const;

export type ColumnKey = (typeof columnDefinitions)[number]["key"];

// ---------- Base globale : données IGDB (les `id` sont ceux d'IGDB) ----------

/**
 * Jeu : l'œuvre, une ligne du backlog. Son `id` est celui de sa fiche IGDB originale,
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
	/** Miniature choisie à l'ajout, parmi la cover et les artworks */
	imageId: IgdbImageId | null;
	/** Choisi à l'ajout */
	endingType: EndingType;
	seriesId: number | null;
	/** Choisi à l'ajout, décimales possibles */
	seriesNumber: number | null;
	franchiseId: number | null;
	developerId: number | null;
	publisherId: number | null;
};

/** Version : toute fiche IGDB rattachée au jeu (originale, édition, remaster, portage, version enrichie), à n'importe quelle profondeur */
export type Version = {
	id: number;
	gameId: number;
	/** `version_title`, sinon `name` ; `null` pour la version originale, qui affiche le nom du jeu */
	title: string | null;
	/** Miniature de la sous-ligne */
	coverImageId: IgdbImageId | null;
	/** « Ouvrir la version sur IGDB » */
	url: string;
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
	/** Abréviation IGDB (`abbreviation`), sinon `name` ; nom choisi à la main pour un émulateur */
	name: string;
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

/** Série (`collections`) */
export type Series = {
	id: number;
	name: string;
};

/** Franchise (`franchise`, `franchises`) */
export type Franchise = {
	id: number;
	name: string;
};

/** Société : développeur ou éditeur (`involved_companies` → `companies`) */
export type Company = {
	id: number;
	name: string;
	/** `company_logos` */
	logoImageId: IgdbImageId | null;
};

/** Nom alternatif d'un jeu (`alternative_names`) */
export type AlternativeName = {
	id: number;
	gameId: number;
	name: string;
	comment: string | null;
};

// ---------- Base utilisateur ----------

/**
 * Variante : une version jouée sur une plateforme, unique par version + plateforme.
 * Elle porte toutes les données de l'utilisateur ; son jeu se retrouve par sa version.
 */
export type Variant = {
	/** id interne, sans équivalent IGDB */
	id: number;
	versionId: number;
	platformId: number;
	status: VariantStatus;
	/** « Possédé » */
	owned: boolean;
	/** « À jouer bientôt » */
	playSoon: boolean;
	/** « Date de fin » : la première fin, `null` si pas fini */
	finishDate: IsoDate | null;
	/** « Fois fini », compteur sûr */
	sureFinishCount: number;
	/** « Fois fini », compteur probable */
	probableFinishCount: number;
	/** « Temps réel », en minutes : temps relevé sur la plateforme */
	trackedPlayTimeMinutes: number;
	/** « Temps estimé », en minutes : estimation manuelle du temps non relevé */
	estimatedPlayTimeMinutes: number;
	/** « Note », entier de 0 à 20 ; `null` si pas noté */
	rating: number | null;
	comment: string | null;
};

/** DLC fait : un DLC du jeu coché comme fait sur une variante */
export type VariantDlc = {
	variantId: number;
	dlcId: number;
};

export type Database = {
	games: Game[];
	versions: Version[];
	versionPlatforms: VersionPlatform[];
	platforms: Platform[];
	dlcs: Dlc[];
	series: Series[];
	franchises: Franchise[];
	companies: Company[];
	alternativeNames: AlternativeName[];
	variants: Variant[];
	variantDlcs: VariantDlc[];
};

// ---------- Interface ----------

/** Résultat de recherche : une fiche IGDB, jeu ou version */
export type SearchResult = {
	/** id IGDB de la fiche ; « déjà en base » si une version porte cet id */
	id: number;
	name: string;
	/** `null` si introuvable ou identique au nom VO : un seul nom s'affiche */
	frenchName: string | null;
	releaseYear: number | null;
	coverImageId: IgdbImageId | null;
};

/** Les trois choix de la modale du jeu (section 8) */
export type GameChoices = {
	imageId: IgdbImageId | null;
	endingType: EndingType;
	seriesNumber: number | null;
};

/** Version puis plateforme d'une nouvelle variante ; la variante n'est créée que si les deux sont choisies */
export type VariantChoice = {
	versionId: number | null;
	platformId: number | null;
};

/** Données IGDB chargées dans la modale d'ajout, écrites en base à « Valider » seulement */
export type GameImport = {
	game: Omit<Game, keyof GameChoices>;
	versions: Version[];
	versionPlatforms: VersionPlatform[];
	/** Plateformes IGDB des versions, ajoutées en base si absentes */
	platforms: Platform[];
	dlcs: Dlc[];
	series: Series | null;
	franchise: Franchise | null;
	developer: Company | null;
	publisher: Company | null;
	alternativeNames: AlternativeName[];
	/** Images proposées : la cover d'abord, puis les artworks */
	imageIds: IgdbImageId[];
};

export type Modal =
	/** Ajout depuis la recherche ; `gameImport` vaut `null` tant que les données IGDB ne sont pas chargées */
	| {
			kind: "addGame";
			igdbId: number;
			gameImport: GameImport | null;
			choices: GameChoices;
			variantChoice: VariantChoice;
	  }
	/** « Modifier le jeu » ; `imageIds` rechargés depuis IGDB à l'ouverture */
	| {
			kind: "editGame";
			gameId: number;
			imageIds: IgdbImageId[] | null;
			choices: GameChoices;
	  }
	/** « Ajouter une variante », ou résultat de recherche déjà en base */
	| { kind: "addVariant"; gameId: number; variantChoice: VariantChoice }
	/** Date de fin proposée au passage au rang 5 ou plus */
	| { kind: "finishDate"; variantId: number; finishDate: IsoDate }
	/** Visibilité et ordre des colonnes */
	| { kind: "columns" };

export type Popover =
	| { kind: "dlc"; variantId: number }
	/** `variantId` à `null` : menu de la ligne du jeu */
	| { kind: "actionsMenu"; gameId: number; variantId: number | null };

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

/** Forme à préciser en phase 8 */
export type ColumnFilter = {
	column: ColumnKey;
	value: string;
};

/** État complet : un `useState` par clé. Hors historique d'annulation et états passagers (chargement, erreur réseau, minuteurs) */
export type AppState = {
	database: Database;
	searchQuery: string;
	searchResults: SearchResult[];
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

// ---------- Lignes du tableau : calculées par les mappers, jamais stockées ----------

/** Sous-ligne : une variante */
export type VariantRow = {
	variantId: number;
	versionId: number;
	/** Cover de la version */
	imageId: IgdbImageId | null;
	/** `null` pour la version originale */
	versionTitle: string | null;
	/** Sortie de la version sur cette plateforme */
	releaseDate: IsoDate | null;
	platform: Platform;
	status: VariantStatus;
	owned: boolean;
	playSoon: boolean;
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

/** Ligne du jeu : données du jeu et agrégats de ses variantes ; `null` quand il est impossible de choisir */
export type GameRow = {
	gameId: number;
	/** Image choisie à l'ajout */
	imageId: IgdbImageId | null;
	name: string;
	frenchName: string | null;
	/** Ligne à variante unique : titre de sa version, s'il ne s'agit pas de l'originale */
	versionTitle: string | null;
	series: Series | null;
	seriesNumber: number | null;
	franchise: Franchise | null;
	developer: Company | null;
	publisher: Company | null;
	/** Date originale du jeu */
	releaseDate: IsoDate | null;
	isCancelled: boolean;
	endingType: EndingType;
	/** `null` si plusieurs variantes */
	platform: Platform | null;
	/** Meilleur statut (section 6) */
	status: VariantStatus | null;
	/** Au moins une variante */
	owned: boolean;
	/** Au moins une variante ; la ligne est mise en valeur */
	playSoon: boolean;
	/** La plus ancienne */
	finishDate: IsoDate | null;
	sureFinishCount: number;
	probableFinishCount: number;
	/** Un DLC compte comme fait s'il l'est sur au moins une variante */
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
	/** Une sous-ligne par variante ; la ligne est dépliable à partir de deux */
	variantRows: VariantRow[];
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

/** Fiche renvoyée par la recherche */
export type IgdbSearchGame = {
	id: number;
	name: string;
	/** Timestamp Unix, en secondes */
	first_release_date?: number;
	cover?: { image_id: IgdbImageId };
	game_localizations?: { name?: string; region?: { identifier?: string } }[];
	alternative_names?: { name?: string; comment?: string }[];
};
