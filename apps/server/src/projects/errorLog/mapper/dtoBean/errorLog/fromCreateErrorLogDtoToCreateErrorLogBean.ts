import type { CreateErrorLogBodyDto } from "@citadel/specs/src/projects/errorLog/endpoint/entries/createErrorLog/createErrorLogBodyDto.ts";

import type { CreateErrorLogBean } from "../../../bean/createErrorLogBean.ts";

export function fromCreateErrorLogDtoToCreateErrorLogBean(
	createErrorLogBodyDto: CreateErrorLogBodyDto,
): CreateErrorLogBean {
	const createErrorLogBean = {
		errorType: createErrorLogBodyDto.errorType,
		message: createErrorLogBodyDto.message,
		stack: createErrorLogBodyDto.stack,
	};
	return createErrorLogBean;
}
