import type { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";

import type { FlowPayload } from "../models/flowPayload.type.ts";
import type { BrowserContextBean } from "./browserContextBean.type.ts";

// Un parcours qui commence par un mail (lien et code)
export type StartFlowBean = {
	kind: FlowKindEnum;
	// null : une inscription, ou un parcours leurre (identifiant inconnu, méthode fermée) : aucun mail ne part
	userId: number | null;
	// L'adresse du mail ; pour un leurre, l'identifiant tapé, qui compte dans les limites comme une adresse
	email: string;
	payload: FlowPayload | null;
	remember: boolean;
	durationMs: number;
	browser: BrowserContextBean;
};
