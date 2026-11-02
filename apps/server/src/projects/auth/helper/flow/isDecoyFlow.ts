import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";

import type { FlowPayload } from "../../models/flowPayload.type.ts";

type FlowFacts = {
	kind: FlowKindEnum;
	userId: number | null;
	payload: FlowPayload | null;
};

/**
 * Un parcours leurre : il répond comme un vrai, mais n'a ni code, ni lien, ni mail. Une inscription sans compte en
 * attente (le champ piège rempli), ou un autre parcours sans compte (identifiant inconnu, méthode fermée)
 */
export function isDecoyFlow({ kind, userId, payload }: FlowFacts): boolean {
	return kind === FlowKindEnum.REGISTRATION
		? payload === null
		: userId === null;
}
