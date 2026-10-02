import type { ApiPrefixEnum } from "../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../specUtils/error/errorResponseDto.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { FactoryDto } from "../dto/factoryDto.ts";

export interface GetAllFactories extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.SATISFACTORY}/getFactory`;
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FactoryDto[];
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
	};
}
