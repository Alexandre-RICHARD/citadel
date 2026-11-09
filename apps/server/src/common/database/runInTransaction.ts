import type { Transaction, TransactionOptions } from "sequelize";

import { sequelize } from "../../configuration/sequelize.ts";
import { AppError } from "../../error/AppError.ts";
import { DatabaseError } from "../../error/DatabaseError.ts";

/**
 * Plusieurs queries en une seule transaction : une erreur annule tout. Une erreur connue (404, 409, échec d'une query…)
 * ressort telle quelle ; une autre (début ou validation de la transaction) devient une DatabaseError.
 *
 * `options.isolationLevel` : REPEATABLE READ (défaut de MariaDB) pose des verrous d'intervalle sur les index. Une transaction
 * qui supprime des lignes puis en insère une (remplacement) peut alors s'interbloquer avec une autre, même pour des
 * lignes sans rapport (deadlock 1213). READ_COMMITTED n'en pose pas
 */
export async function runInTransaction<Result>(
	failureMessage: string,
	work: (transaction: Transaction) => Promise<Result>,
	options: TransactionOptions = {},
): Promise<Result> {
	try {
		return await sequelize.transaction(options, work);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new DatabaseError(failureMessage, { cause: error });
	}
}
