import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { MeDto } from "../../../dto/meDto.type.ts";

// Qui est connecté. Son 401 veut dire « pas connecté » : le front le lit pour savoir s'il affiche le compte
export interface GetMe extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/me`;
		method: HttpMethodEnum.GET;
		protected: true;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: MeDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
