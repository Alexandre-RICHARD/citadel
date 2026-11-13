import type { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";

import type { FlowPayload } from "../models/flowPayload.type.ts";
import type { BrowserContextBean } from "./browserContextBean.type.ts";

// Un parcours qui commence par un email (lien et code)
export type StartFlowBean = {
	kind: FlowKindEnum;
	// null : une inscription, ou un parcours leurre (identifiant inconnu, méthode fermée) : aucun email ne part
	userId: number | null;
	// L'adresse de l'email ; pour un leurre, l'identifiant tapé
	email: string;
	// null pour une inscription : un leurre (le champ piège rempli), aucun email ne part
	payload: FlowPayload | null;
	remember: boolean;
	durationMs: number;
	browser: BrowserContextBean;
};
