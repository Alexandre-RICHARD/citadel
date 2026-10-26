import type { SeriesEntry } from "./seriesEntry.type.ts";

// Glisser-déposer de « Réorganiser la série » (cahier des charges, §8), vu depuis la liste sans les jeux qui bougent
export type SeriesDrop = {
	// Le jeu glissé, puis ses sous-jeux s'il est principal
	block: SeriesEntry[];
	// Les autres jeux
	rest: SeriesEntry[];
	// Le jeu au-dessus du trait ; `null` tout en haut
	above: SeriesEntry | null;
	// Sous-jeu de la famille au-dessus, sinon principal
	isSub: boolean;
	isMovingDown: boolean;
};
