import type { FlowDto } from "./flowDto.type.ts";

// Où en est le navigateur. null : plus aucun parcours, parce qu'il vient de se terminer (la session est ouverte, son
// cookie posé, ou le facteur email est activé), ou qu'il n'y en a jamais eu, ou qu'il a expiré ou été abandonné
export type FlowStatusDto = {
	flow: FlowDto | null;
	// Seulement quand le parcours qui se termine active le premier second facteur du compte (le facteur email) : ses
	// codes de secours, montrés cette seule fois
	recoveryCodes?: string[];
};
