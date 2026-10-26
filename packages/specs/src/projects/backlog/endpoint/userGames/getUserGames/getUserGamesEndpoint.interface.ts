import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { UserGameListDto } from "../../../dto/userGame/userGameListDto.type.ts";
import type { GetUserGamesQueryParamDto } from "./getUserGamesQueryParamDto.type.ts";

// Tableau du backlog : une page de lignes, triées et filtrées par le serveur
export interface GetUserGames extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-games`;
		method: HttpMethodEnum.GET;
		protected: false;
		queryParams: GetUserGamesQueryParamDto;
	};
	response:
		| {
				status: HttpStatutCodeSuccessEnum.SUCCESS;
				data: UserGameListDto;
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
