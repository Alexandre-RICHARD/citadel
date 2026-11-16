import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { UserMediaListDto } from "../../../dto/userMedia/userMediaListDto.type.ts";
import type { GetAllUserMediaQueryParamDto } from "./getAllUserMediaQueryParamDto.type.ts";

// Tableau des films et séries : une page de lignes, triées et filtrées par le serveur
export interface GetAllUserMedia extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-media`;
		method: HttpMethodEnum.GET;
		protected: true;
		queryParams: GetAllUserMediaQueryParamDto;
	};
	response:
		| {
				status: HttpStatutCodeSuccessEnum.SUCCESS;
				data: UserMediaListDto;
		  }
		| {
				status: HttpStatutCodeSuccessEnum.NO_CONTENT;
				data: null;
		  };
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
