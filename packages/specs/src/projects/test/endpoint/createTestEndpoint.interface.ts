import type { ApiPrefixEnum } from "../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { TestDto } from "../dto/testDto.type.ts";

// TODO Implémenter la nouvelle manière de faire avec zod
export interface CreateTest extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.TEST}/test`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: {
			name: string;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: TestDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
