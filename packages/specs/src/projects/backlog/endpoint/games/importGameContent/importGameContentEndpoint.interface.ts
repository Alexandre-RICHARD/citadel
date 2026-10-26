import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { StoredGameDto } from "../../../dto/game/storedGameDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { ImportGameContentBodyDto } from "./importGameContentBodyDto.type.ts";
import type { ImportGameContentPathParamDto } from "./importGameContentPathParamDto.type.ts";

// « Modifier le jeu » et « Rechercher d'autres DLC » : ajoute au jeu des versions et DLC IGDB ; ceux déjà en base sont ignorés
export interface ImportGameContent extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/games/:gameId/imports`;
		method: HttpMethodEnum.POST;
		protected: false;
		pathParams: ImportGameContentPathParamDto;
		body: ImportGameContentBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: StoredGameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.GAME_NOT_FOUND
			| BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND
			| BacklogErrorCodeEnum.VERSION_NOT_FOUND
			| BacklogErrorCodeEnum.DLC_NOT_FOUND
		>;
		[HttpStatutCodeErrorEnum.BAD_GATEWAY]: ErrorResponseDto<BacklogErrorCodeEnum.IGDB_UNAVAILABLE>;
	};
}
