import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { FlowStatusDto } from "../../../dto/flowStatusDto.type.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { SubmitFlowCodeBodyDto } from "./submitFlowCodeBodyDto.type.ts";

// Le code reçu par email, tapé dans la page restée ouverte (sur n'importe quel appareil : seul le cookie du parcours
// compte). Accepté, le parcours passe à son étape suivante, ou se termine en ouvrant la session
export interface SubmitFlowCode extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/flow/code`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: SubmitFlowCodeBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]:
			| ValidationErrorResponseDto
			| ErrorResponseDto<
					| AuthErrorCodeEnum.INVALID_CODE
					| AuthErrorCodeEnum.CODE_ATTEMPTS_EXHAUSTED
					| AuthErrorCodeEnum.FLOW_EXPIRED
			  >;
		// Inscription : pseudo pris entre la demande et la confirmation ; le code reste valable avec un autre pseudo
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<
			AuthErrorCodeEnum.USERNAME_TAKEN | AuthErrorCodeEnum.EMAIL_TAKEN
		>;
	};
}
