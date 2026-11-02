import type { CreateErrorLogBean } from "../bean/createErrorLogBean.type.ts";
import { createErrorLogQuery } from "../query/createErrorLogQuery.ts";
import { deleteErrorLogsBeforeQuery } from "../query/deleteErrorLogsBeforeQuery.ts";

// Seul logError écrit dans error_log : aucun endpoint n'y donne accès
class ErrorLogService {
	async createErrorLog(createErrorLogBean: CreateErrorLogBean): Promise<void> {
		await createErrorLogQuery(createErrorLogBean);
	}

	// Une erreur peut citer une donnée personnelle : rien ne reste plus de `retentionMs` (20 jours, règle des 3 mois)
	async purge(now: Date, retentionMs: number): Promise<void> {
		await deleteErrorLogsBeforeQuery(new Date(now.getTime() - retentionMs));
	}
}

export const errorLogService = new ErrorLogService();
