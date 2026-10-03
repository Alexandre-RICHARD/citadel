import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ErrorLogDto } from "../../../dto/errorLog/errorLogDto.type.ts";
import type { CreateErrorLogBodyDto } from "./createErrorLogBodyDto.type.ts";

export interface CreateErrorLog extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.ERROR_LOG}/entries`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: CreateErrorLogBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: ErrorLogDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
