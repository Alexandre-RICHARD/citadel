import { DatabaseError } from "../../../error/DatabaseError.ts";
import type { CreateErrorLogBean } from "../bean/createErrorLogBean.type.ts";
import { ErrorLog } from "../models/ErrorLog.ts";

export async function createErrorLogQuery(
	createErrorLogBean: CreateErrorLogBean,
): Promise<ErrorLog> {
	try {
		const newErrorLog = await ErrorLog.create({
			errorType: createErrorLogBean.errorType,
			message: createErrorLogBean.message,
			stack: createErrorLogBean.stack,
		});
		return newErrorLog;
	} catch (error) {
		throw new DatabaseError("Failed to insert new error log", {
			cause: error,
		});
	}
}
