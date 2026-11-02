import { DatabaseError } from "../../../error/DatabaseError.ts";
import type { CreateErrorLogBean } from "../bean/createErrorLogBean.type.ts";
import { ErrorLog } from "../models/ErrorLog.ts";

export async function createErrorLogQuery(
	createErrorLogBean: CreateErrorLogBean,
): Promise<void> {
	try {
		await ErrorLog.create({
			errorType: createErrorLogBean.errorType,
			message: createErrorLogBean.message,
			stack: createErrorLogBean.stack,
		});
	} catch (error) {
		throw new DatabaseError("Failed to insert new error log", {
			cause: error,
		});
	}
}
