import { mapDateToString } from "@citadel/common/src/universal/date/mapDateToString.ts";
import type { ErrorLogDto } from "@citadel/specs/src/projects/errorLog/dto/errorLog/errorLogDto.ts";

import type { ErrorLogBean } from "../../../bean/errorLogBean.ts";

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
