export type Death = {
	id: number;
	bossId: number;
	date: string;
	comment: string | null;
};

export type Boss = {
	id: number;
	gameId: number;
	name: string;
	defeatedAt: string | null;
	deaths: Death[];
};

export type Game = {
	id: number;
	name: string;
	startedAt: string;
	endedAt: string | null;
	bosses: Boss[];
};

export type GamesList = Game[];
