import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { FactorListDto } from "../../../dto/factorListDto.type.ts";

// La double authentification du compte connecté : ses facteurs actifs et le nombre de codes de secours restants
export interface ListFactors extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/factors`;
		method: HttpMethodEnum.GET;
		protected: true;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FactorListDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
