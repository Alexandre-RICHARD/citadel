import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameImagesDto } from "../../../dto/igdb/gameImagesDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { GetGameImagesPathParamDto } from "./getGameImagesPathParamDto.type.ts";

// Images proposées pour la miniature d'un jeu, relues sur IGDB à l'ajout au backlog et par « Personnaliser »
export interface GetGameImages extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/igdb/games/:igdbId/images`;
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: GetGameImagesPathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: GameImagesDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND>;
		[HttpStatutCodeErrorEnum.BAD_GATEWAY]: ErrorResponseDto<BacklogErrorCodeEnum.IGDB_UNAVAILABLE>;
	};
}
