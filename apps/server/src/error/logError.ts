import { inspect } from "node:util";

import { createErrorLog } from "../projects/errorLog/query/createErrorLog.ts";

/**
 * Ne throw jamais pour ne pas freeze le serveur
 * @param context Où l'erreur s'est produite
 */
export async function logError(error: unknown, context: string): Promise<void> {
	const errorDetail = inspect(error, { depth: 5 });
	console.error(`[${context}]`, errorDetail);

	try {
		await createErrorLog({
			errorType: error instanceof Error ? error.name : typeof error,
			message: `[${context}] ${error instanceof Error ? error.message : String(error)}`,
			stack: errorDetail,
		});
	} catch (loggingError) {
		console.error(
			`[${context}] Échec de l'écriture dans error_log :`,
			inspect(loggingError, { depth: 5 }),
		);
	}
}
