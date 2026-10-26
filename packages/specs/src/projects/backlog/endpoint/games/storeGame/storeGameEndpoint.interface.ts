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
import type { StoreGameBodyDto } from "./storeGameBodyDto.type.ts";

// « Valider » de la modale d'ajout : le jeu, sa version originale, les versions et DLC cochés, relus sur IGDB
export interface StoreGame extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/games`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: StoreGameBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: StoredGameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND
			| BacklogErrorCodeEnum.VERSION_NOT_FOUND
			| BacklogErrorCodeEnum.DLC_NOT_FOUND
		>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.GAME_ALREADY_STORED>;
		[HttpStatutCodeErrorEnum.BAD_GATEWAY]: ErrorResponseDto<BacklogErrorCodeEnum.IGDB_UNAVAILABLE>;
	};
}
