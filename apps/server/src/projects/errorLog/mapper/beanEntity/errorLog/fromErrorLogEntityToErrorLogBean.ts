import type { ErrorLogBean } from "../../../bean/errorLogBean.ts";
import type { ErrorLog } from "../../../models/ErrorLog.ts";

export function fromErrorLogEntityToErrorLogBean(
	errorLog: ErrorLog,
): ErrorLogBean {
	const errorLogBean = {
		id: errorLog.id,
		errorType: errorLog.errorType,
		message: errorLog.message,
		stack: errorLog.stack,
		createdAt: errorLog.createdAt,
	};
	return errorLogBean;
}
