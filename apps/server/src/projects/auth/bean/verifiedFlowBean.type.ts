import type { Flow } from "../models/Flow.ts";

// Un parcours dont le mail vient d'être validé, avec le jeton du cookie de ce navigateur (pour le poser de nouveau
// quand le parcours continue)
export type VerifiedFlowBean = {
	flow: Flow;
	flowToken: string;
};
