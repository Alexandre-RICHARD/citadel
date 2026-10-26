import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { IgdbSearchResultListDto } from "../../../dto/igdb/igdbSearchResultListDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { SearchIgdbGamesQueryParamDto } from "./searchIgdbGamesQueryParamDto.type.ts";

// Barre de recherche : jeux de base trouvés sur IGDB, chacun signalé s'il est déjà en base ou dans le backlog
export interface SearchIgdbGames extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/igdb/search`;
		method: HttpMethodEnum.GET;
		protected: false;
		queryParams: SearchIgdbGamesQueryParamDto;
	};
	response:
		| {
				status: HttpStatutCodeSuccessEnum.SUCCESS;
				data: IgdbSearchResultListDto;
		  }
		| {
				status: HttpStatutCodeSuccessEnum.NO_CONTENT;
				data: null;
		  };
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_GATEWAY]: ErrorResponseDto<BacklogErrorCodeEnum.IGDB_UNAVAILABLE>;
	};
}
