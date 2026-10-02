import type { Death } from "./death.type";

export type Boss = {
	id: number;
	gameId: number;
	name: string;
	defeatedAt: string | null;
	deaths: Death[];
};
