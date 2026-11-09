import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { DeleteStoredGamePathParamDto } from "./deleteStoredGamePathParamDto.type.ts";

// Supprimer un jeu de la base, avec ses versions et ses DLC : seulement si aucun compte ne l'a dans son backlog
export interface DeleteStoredGame extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/games/:gameId`;
		method: HttpMethodEnum.DELETE;
		protected: true;
		pathParams: DeleteStoredGamePathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.NO_CONTENT;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.GAME_NOT_FOUND>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.GAME_IN_A_BACKLOG>;
	};
}
