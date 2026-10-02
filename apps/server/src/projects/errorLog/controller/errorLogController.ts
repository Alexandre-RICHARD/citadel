import type { CreateErrorLog } from "@citadel/specs/src/projects/errorLog/endpoint/entries/createErrorLog/createErrorLogEndpoint.type.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";

import { asyncRequestHandler } from "../../../common/routing/asyncRequestHandler.ts";
import { fromCreateErrorLogDtoToCreateErrorLogBean } from "../mapper/dtoBean/errorLog/fromCreateErrorLogDtoToCreateErrorLogBean.ts";
import { fromErrorLogBeanToErrorLogDto } from "../mapper/dtoBean/errorLog/fromErrorLogBeanToErrorLogDto.ts";
import { errorLogService } from "../service/errorLogService.ts";

export const errorLogController = {
	create: asyncRequestHandler<CreateErrorLog>(async (request, response) => {
		const createErrorLogBean = fromCreateErrorLogDtoToCreateErrorLogBean(
			request.body,
		);

		const errorLog = await errorLogService.createErrorLog(createErrorLogBean);

		return response
			.status(HttpStatutCodeSuccessEnum.CREATED)
			.json(fromErrorLogBeanToErrorLogDto(errorLog));
	}),
};
