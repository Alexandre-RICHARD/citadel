import { errorLogService } from "../projects/errorLog/service/errorLogService.ts";
import { describeError } from "./describeError.ts";

export async function logError(error: unknown, context: string): Promise<void> {
	const errorDetail = describeError(error);
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
			describeError(loggingError),
		);
	}
}
