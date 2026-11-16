import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { SagaListDto } from "../../../dto/saga/sagaListDto.type.ts";

// Les sagas du compte, par nom, pour les choisir à l'ajout ou par « Personnaliser »
export interface GetAllSagas extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/sagas`;
		method: HttpMethodEnum.GET;
		protected: true;
	};
	response:
		| {
				status: HttpStatutCodeSuccessEnum.SUCCESS;
				data: SagaListDto;
		  }
		| {
				status: HttpStatutCodeSuccessEnum.NO_CONTENT;
				data: null;
		  };
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
