import type { ApiPrefixEnum } from "../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../specUtils/error/errorResponseDto.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { AwesomeSinkDto } from "../dto/awesomeSinkDto.ts";

export interface GetExplorationSink extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.SATISFACTORY}/getExplorationSink`;
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: AwesomeSinkDto[];
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
	};
}
