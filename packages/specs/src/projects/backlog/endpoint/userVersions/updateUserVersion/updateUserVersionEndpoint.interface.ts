import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { UserGameDto } from "../../../dto/userGame/userGameDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { UpdateUserVersionBodyDto } from "./updateUserVersionBodyDto.type.ts";
import type { UpdateUserVersionPathParamDto } from "./updateUserVersionPathParamDto.type.ts";

// Une cellule du tableau, ou la date de fin de la petite fenêtre : seuls les champs modifiés sont envoyés
export interface UpdateUserVersion extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-versions/:id`;
		method: HttpMethodEnum.PATCH;
		protected: false;
		pathParams: UpdateUserVersionPathParamDto;
		body: UpdateUserVersionBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: UserGameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.STATUS_NOT_ALLOWED>;
	};
}
