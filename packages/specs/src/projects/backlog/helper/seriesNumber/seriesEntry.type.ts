/**
 * Un jeu du backlog et son numéro dans sa série. Le numéro est unique dans la série, à partir de 1, avec 3 décimales
 * au plus. Un entier est un jeu principal ; avec des décimales, un sous-jeu de ce principal (Crisis Core = 7.1 sous
 * FF VII = 7) : un principal et ses sous-jeux forment une famille. Les rangs vont de 3.1 à 3.9, puis toute la famille
 * passe à deux chiffres (3.01 … 3.10), puis à trois. Les trous sont permis : un jeu qui part laisse sa place vide, rien
 * n'est renuméroté, et un principal remis à son numéro retrouve ses sous-jeux
 */
export type SeriesEntry = {
	gameId: number;
	seriesNumber: number;
};
