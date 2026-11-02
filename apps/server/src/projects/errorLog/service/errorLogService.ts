import type { CreateErrorLogBean } from "../bean/createErrorLogBean.type.ts";
import { createErrorLogQuery } from "../query/createErrorLogQuery.ts";

// Seul logError écrit dans error_log : aucun endpoint n'y donne accès
class ErrorLogService {
	async createErrorLog(createErrorLogBean: CreateErrorLogBean): Promise<void> {
		await createErrorLogQuery(createErrorLogBean);
	}
}

export const errorLogService = new ErrorLogService();
