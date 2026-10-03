import type { ApiPrefixEnum } from "../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ExtractorDto } from "../dto/extractorDto.type.ts";

export interface GetAllExtractors extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.SATISFACTORY}/getExtractor`;
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: ExtractorDto[];
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
