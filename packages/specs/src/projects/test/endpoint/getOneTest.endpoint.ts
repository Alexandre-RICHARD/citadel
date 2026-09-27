import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../specUtils/error/errorResponse.dto.ts";
import type { ValidationErrorResponseDto } from "../../../specUtils/error/validationErrorResponse.dto.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { TestDto } from "../dto/test.dto.ts";

// TODO Implémenter la nouvelle manière de faire avec zod
export interface GetOneTest extends EndpointModel {
	request: {
		url: "/test/test/:id";
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: {
			id: string;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: TestDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
