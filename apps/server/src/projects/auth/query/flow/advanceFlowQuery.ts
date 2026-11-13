import type { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Flow } from "../../models/Flow.ts";

type Advance = {
	flowId: number;
	step: FlowStepEnum;
	// Chaque étape a sa propre durée, comptée depuis son début
	expiresAt: Date;
};

// Le parcours passe à son étape suivante : essais remis à zéro, aucun email encore envoyé pour elle
export async function advanceFlowQuery(
	{ flowId, step, expiresAt }: Advance,
	transaction: Transaction,
): Promise<void> {
	try {
		await Flow.update(
			{ step, expiresAt, attempts: 0, lastSentAt: null },
			{ where: { id: flowId }, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to advance flow", { cause: error });
	}
}
