import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { StoredGameListDto } from "../../../dto/game/storedGameListDto.type.ts";
import type { GetStoredGamesQueryParamDto } from "./getStoredGamesQueryParamDto.type.ts";

// « Ma base » : les jeux en base hors backlog dont un nom ou un titre de version contient la saisie, par pages
export interface GetStoredGames extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/games`;
		method: HttpMethodEnum.GET;
		protected: false;
		queryParams: GetStoredGamesQueryParamDto;
	};
	response:
		| {
				status: HttpStatutCodeSuccessEnum.SUCCESS;
				data: StoredGameListDto;
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
