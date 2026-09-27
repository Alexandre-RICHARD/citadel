import type { ApiPrefixEnum } from "../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../specUtils/error/errorResponse.dto.ts";
import type { ValidationErrorResponseDto } from "../../../specUtils/error/validationErrorResponse.dto.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";

// TODO Implémenter la nouvelle manière de faire avec zod
export interface DeleteTest extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.TEST}/test/:id`;
		method: HttpMethodEnum.DELETE;
		protected: false;
		pathParams: {
			id: string;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
