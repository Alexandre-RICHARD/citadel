import type { Flow } from "../models/Flow.ts";

// Un parcours dont l'email vient d'être validé, avec le jeton du cookie de ce navigateur (pour le poser de nouveau
// quand le parcours continue) et ce qui l'a validé : le code ou le lien
export type VerifiedFlowBean = {
	flow: Flow;
	flowToken: string;
	proofKind: "code" | "link";
};
