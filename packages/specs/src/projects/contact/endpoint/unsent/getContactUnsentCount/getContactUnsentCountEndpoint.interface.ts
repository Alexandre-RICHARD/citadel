import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ContactUnsentCountDto } from "../../../dto/contactUnsentCountDto.type.ts";

// Lu par la console du NAS seulement, par le réseau Docker : une requête passée par Caddy reçoit une 404
export interface GetContactUnsentCount extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.CONTACT}/unsent`;
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: ContactUnsentCountDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
