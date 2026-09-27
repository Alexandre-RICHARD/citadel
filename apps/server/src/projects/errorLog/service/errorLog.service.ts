import type { CreateErrorLogBean } from "../bean/createErrorLog.bean.ts";
import type { ErrorLogBean } from "../bean/errorLog.bean.ts";
import { fromErrorLogEntityToErrorLogBean } from "../mapper/beanEntity/errorLog/fromErrorLogEntityToErrorLogBean.ts";
import { createErrorLogQuery } from "../query/createErrorLog.query.ts";

class ErrorLogService {
	async createErrorLog(
		createErrorLogBean: CreateErrorLogBean,
	): Promise<ErrorLogBean> {
		const errorLogEntity = await createErrorLogQuery(createErrorLogBean);
		return fromErrorLogEntityToErrorLogBean(errorLogEntity);
	}
}

export const errorLogService = new ErrorLogService();
