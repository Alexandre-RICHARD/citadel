import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { TechnicalErrorCodeEnum } from "../../../../../specUtils/error/technicalErrorCode.enum.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { UnlockNasBodyDto } from "./unlockNasBodyDto.type.ts";

/**
 * Le mot de passe des médias : déverrouille le mode connecté pour 12 h, dans un cookie signé. Seul le compte du
 * propriétaire du NAS le peut ; cinq essais par adresse sur un quart d'heure
 */
export interface UnlockNas extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/nas/unlock`;
		method: HttpMethodEnum.POST;
		protected: true;
		body: UnlockNasBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.NO_CONTENT;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION]: ErrorResponseDto<BacklogErrorCodeEnum.MEDIA_PASSWORD_INVALID>;
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<BacklogErrorCodeEnum.NAS_OWNER_ONLY>;
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: ErrorResponseDto<TechnicalErrorCodeEnum.TOO_MANY_REQUESTS>;
	};
}
