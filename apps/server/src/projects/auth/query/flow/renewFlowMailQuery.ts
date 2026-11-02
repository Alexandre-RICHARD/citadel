import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type Renewal = {
	flowId: number;
	// null : un leurre, ou une adresse déjà inscrite, sans code ni lien
	codeHmac: Buffer | null;
	linkTokenHash: Buffer | null;
	sentAt: Date;
};

// Un nouveau mail : l'ancien code et l'ancien lien ne valent plus, les essais repartent de zéro
export async function renewFlowMailQuery({
	flowId,
	codeHmac,
	linkTokenHash,
	sentAt,
}: Renewal): Promise<void> {
	try {
		await sequelize.query(
			`UPDATE auth_flow
			SET code_hmac = :codeHmac, link_token_hash = :linkTokenHash, attempts = 0, send_count = send_count + 1,
				last_sent_at = :sentAt
			WHERE id = :flowId`,
			{
				type: QueryTypes.UPDATE,
				replacements: { flowId, codeHmac, linkTokenHash, sentAt },
			},
		);
	} catch (error) {
		throw new DatabaseError("Failed to renew the flow mail", { cause: error });
	}
}
