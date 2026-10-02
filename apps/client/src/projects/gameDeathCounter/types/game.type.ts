import type { Boss } from "./boss.type";

export type Game = {
	id: number;
	name: string;
	startedAt: string;
	endedAt: string | null;
	bosses: Boss[];
};
