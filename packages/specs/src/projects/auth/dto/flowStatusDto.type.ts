import type { FlowDto } from "./flowDto.type.ts";

// Où en est le navigateur. null : plus aucun parcours, parce qu'il vient de se terminer (la session est ouverte, son
// cookie posé), ou qu'il n'y en a jamais eu, ou qu'il a expiré ou été abandonné
export type FlowStatusDto = {
	flow: FlowDto | null;
};
