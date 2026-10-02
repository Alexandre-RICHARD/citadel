import type { ApiPrefixEnum } from "../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../specUtils/error/errorResponseDto.ts";
import type { ValidationErrorResponseDto } from "../../../specUtils/error/validationErrorResponseDto.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { TestDto } from "../dto/testDto.ts";

// TODO Implémenter la nouvelle manière de faire avec zod
export interface GetOneTest extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.TEST}/test/:id`;
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
