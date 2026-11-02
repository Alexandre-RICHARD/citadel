import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import type { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";

import { runInTransaction } from "../../../../common/database/runInTransaction.ts";
import { Flow } from "../../models/Flow.ts";
import type { FlowPayload } from "../../models/flowPayload.type.ts";

type FlowRow = {
	tokenHash: Buffer;
	kind: FlowKindEnum;
	step: FlowStepEnum;
	userId: number | null;
	email: string;
	payload: FlowPayload | null;
	codeHmac: Buffer | null;
	linkTokenHash: Buffer | null;
	remember: boolean;
	// null : l'étape n'envoie pas de mail
	sentAt: Date | null;
	expiresAt: Date;
};

type Replaced = {
	// Le parcours en cours dans ce navigateur : un seul à la fois
	browserTokenHash: Buffer | null;
	// Une inscription remplace celles qui attendent à la même adresse : la personne qui reçoit les mails gagne toujours
	registrationEmail: string | null;
};

// Crée le parcours, après avoir supprimé ceux qu'il remplace, ensemble
export async function createFlowQuery(
	row: FlowRow,
	{ browserTokenHash, registrationEmail }: Replaced,
): Promise<Flow> {
	return runInTransaction("Failed to create flow", async (transaction) => {
		if (browserTokenHash !== null)
			await Flow.destroy({
				where: { tokenHash: browserTokenHash },
				transaction,
			});
		if (registrationEmail !== null)
			await Flow.destroy({
				where: {
					email: registrationEmail,
					kind: FlowKindEnum.REGISTRATION,
				},
				transaction,
			});
		return Flow.create(
			{
				tokenHash: row.tokenHash,
				kind: row.kind,
				step: row.step,
				userId: row.userId,
				email: row.email,
				payload: row.payload,
				codeHmac: row.codeHmac,
				linkTokenHash: row.linkTokenHash,
				remember: row.remember,
				lastSentAt: row.sentAt,
				sendCount: row.sentAt === null ? 0 : 1,
				expiresAt: row.expiresAt,
			},
			{ transaction },
		);
	});
}
