import type { Transaction } from "sequelize";

import { sequelize } from "../../configuration/sequelize.ts";
import { AppError } from "../../error/AppError.ts";
import { DatabaseError } from "../../error/DatabaseError.ts";

/**
 * Plusieurs queries en une seule transaction : une erreur annule tout. Une erreur connue (404, 409, échec d'une query…)
 * ressort telle quelle ; une autre (début ou validation de la transaction) devient une DatabaseError
 */
export async function runInTransaction<Result>(
	failureMessage: string,
	work: (transaction: Transaction) => Promise<Result>,
): Promise<Result> {
	try {
		return await sequelize.transaction(work);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new DatabaseError(failureMessage, { cause: error });
	}
}
