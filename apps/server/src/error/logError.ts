import { inspect } from "node:util";

import { errorLogService } from "../projects/errorLog/service/errorLogService.ts";

export async function logError(error: unknown, context: string): Promise<void> {
	const errorDetail = inspect(error, { depth: 5 });
	console.error(`[${context}]`, errorDetail);

	try {
		await errorLogService.createErrorLog({
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
