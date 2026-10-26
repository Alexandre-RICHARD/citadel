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
import type { SetDlcDoneBodyDto } from "./setDlcDoneBodyDto.type.ts";
import type { SetDlcDonePathParamDto } from "./setDlcDonePathParamDto.type.ts";

// Case « fait » d'un DLC sur une version jouée (popover des DLC)
export interface SetDlcDone extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-versions/:id/done-dlcs/:dlcId`;
		method: HttpMethodEnum.PATCH;
		protected: false;
		pathParams: SetDlcDonePathParamDto;
		body: SetDlcDoneBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: UserGameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND
			| BacklogErrorCodeEnum.DLC_NOT_FOUND
		>;
	};
}
