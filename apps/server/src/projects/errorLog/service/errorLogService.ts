import type { CreateErrorLogBean } from "../bean/createErrorLogBean.type.ts";
import type { ErrorLogBean } from "../bean/errorLogBean.type.ts";
import { fromErrorLogEntityToErrorLogBean } from "../mapper/beanEntity/errorLog/fromErrorLogEntityToErrorLogBean.ts";
import { createErrorLogQuery } from "../query/createErrorLogQuery.ts";

class ErrorLogService {
	async createErrorLog(
		createErrorLogBean: CreateErrorLogBean,
	): Promise<ErrorLogBean> {
		const errorLogEntity = await createErrorLogQuery(createErrorLogBean);
		return fromErrorLogEntityToErrorLogBean(errorLogEntity);
	}
}

export const errorLogService = new ErrorLogService();
