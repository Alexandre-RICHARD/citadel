import { QueryTypes, type Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

/**
 * Efface le code et le lien de l'email que l'on vient de valider, s'ils sont toujours ceux-là : deux validations envoyées
 * ensemble (double clic, code et lien) n'en font qu'une. false : déjà validé, ou remplacé par un renvoi. Dans la
 * transaction de la suite : si elle échoue (pseudo pris entre-temps), le code et le lien restent valables
 */
export async function claimFlowMailStepQuery(
	flowId: number,
	linkTokenHash: Buffer,
	transaction: Transaction,
): Promise<boolean> {
	try {
		const [, affectedRows] = await sequelize.query(
			`UPDATE auth_flow SET code_hmac = NULL, link_token_hash = NULL
			WHERE id = :flowId AND link_token_hash = :linkTokenHash`,
			{
				type: QueryTypes.UPDATE,
				replacements: { flowId, linkTokenHash },
				transaction,
			},
		);
		return affectedRows === 1;
	} catch (error) {
		throw new DatabaseError("Failed to claim the flow mail step", {
			cause: error,
		});
	}
}
