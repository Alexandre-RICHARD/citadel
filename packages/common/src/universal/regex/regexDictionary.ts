/**
 * Toutes les regex du repo, sauf celles des règles ESLint (eslint-config ne peut pas dépendre de common)
 * et des scripts bash.
 * Attention : une regex avec le drapeau g garde sa position entre deux appels à test() ou exec().
 * Celles-ci ne servent qu'avec replace(), qui repart toujours du début
 */
export const regexDictionary = {
	// Nombre entier écrit en chiffres, sans zéro en tête (sauf "0") : "7", "42", mais ni "007" ni "1e3"
	decimalInteger: /^(0|[1-9][0-9]*)$/,

	// Numéro dans une série tapé par l'utilisateur : partie entière, puis jusqu'à 3 décimales après un point ou une virgule, capturées
	seriesNumberInput: /^(\d+)(?:[.,](\d{1,3}))?$/u,

	// image_id d'une image IGDB : lettres minuscules et chiffres ("co1tnw")
	igdbImageId: /^[a-z0-9]+$/,

	// Signe diacritique (accent, cédille…) d'un texte décomposé par normalize("NFD")
	diacritic: /\p{Diacritic}/gu,

	// Caractère spécial d'un motif LIKE en SQL (%, _ et l'échappement \), à échapper pour le chercher tel quel
	sqlLikeWildcard: /[\\%_]/g,

	// Paramètre d'une URL d'endpoint : ":gameId" dans "/games/:gameId/bosses", nom capturé
	urlPathParam: /:([A-Za-z0-9_]+)/g,

	// Espace fine insécable, utilisée par Intl.NumberFormat("fr-FR") comme séparateur de milliers
	narrowNoBreakSpace: /\u202f/g,

	// Séparateur de chemin Windows, à remplacer par "/"
	windowsPathSeparator: /\\/g,

	// Fichier situé dans node_modules, quel que soit le séparateur de chemin
	nodeModulesPath: /[\\/]node_modules[\\/]/,

	// Fichier du package design-system, quel que soit le séparateur de chemin
	designSystemPackagePath: /[\\/]packages[\\/]design-system[\\/]/,

	// Dossier d'un projet du client : "gameDeathCounter" dans ".../src/projects/gameDeathCounter/...", nom capturé
	clientProjectFolder: /\/src\/projects\/([^/]+)/,

	// Fichier de traductions du client : langue capturée, puis extension
	clientTranslationFile:
		/\/src\/.*\/translations\/([^/]+)\/.*\.translations\.(ts|js|json)$/,

	// Drivers de base de données que Sequelize charge à la demande et que le serveur n'utilise pas (MariaDB seul), nom exact du module importé
	sequelizeUnusedDriver: /^(pg-hstore|pg|mysql2|sqlite3|tedious)$/,

	// N'importe quel chemin, pour un filtre esbuild qui doit tout attraper
	anyPath: /.*/,
} as const;
