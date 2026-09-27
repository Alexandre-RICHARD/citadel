import type { ErrorLogDto } from "@citadel/specs/src/projects/errorLog/dto/errorLog/errorLog.dto.ts";

import { mapDateToString } from "../../../../../common/date/mapDateToString.ts";
import type { ErrorLogBean } from "../../../bean/errorLog.bean.ts";

export function fromErrorLogBeanToErrorLogDto(
	errorLogBean: ErrorLogBean,
): ErrorLogDto {
	const errorLogDto = {
		id: errorLogBean.id,
		errorType: errorLogBean.errorType,
		message: errorLogBean.message,
		stack: errorLogBean.stack,
		createdAt: mapDateToString(errorLogBean.createdAt),
	};
	return errorLogDto;
}
