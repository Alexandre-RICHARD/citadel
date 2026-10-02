import { QueryTypes } from "sequelize";
import { expect, vi } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";

type ErrorLogSummaryRow = {
	errorType: string;
	message: string;
};

type MaxIdRow = {
	maxId: number | null;
};

/**
 * À appeler avant une requête censée finir en 500 : mémorise le dernier error_log,
 * puis `expectLogged` vérifie qu'exactement une nouvelle entrée a été écrite.
 * L'écriture est lancée sans être attendue par globalErrorHandler, d'où l'attente active.
 * console.error est réduit au silence le temps du test : logError y affiche la pile complète.
 */
export async function watchErrorLogs(): Promise<{
	expectLogged: (expected: ErrorLogSummaryRow) => Promise<void>;
}> {
	vi.spyOn(console, "error").mockImplementation(() => undefined);

	const maxIdRow = await sequelize.query<MaxIdRow>(
		"SELECT MAX(id) AS maxId FROM error_log",
		{ type: QueryTypes.SELECT, plain: true },
	);
	const lastIdBefore = maxIdRow?.maxId ?? 0;

	return {
		async expectLogged(expected) {
			await vi.waitFor(async () => {
				const newErrorLogs = await sequelize.query<ErrorLogSummaryRow>(
					`SELECT error_type AS errorType, message
					FROM error_log
					WHERE id > :lastIdBefore
					ORDER BY id`,
					{ type: QueryTypes.SELECT, replacements: { lastIdBefore } },
				);
				expect(newErrorLogs).toStrictEqual([expected]);
			});
		},
	};
}
