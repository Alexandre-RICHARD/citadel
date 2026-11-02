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
import type { SubmitNewPasswordBodyDto } from "./submitNewPasswordBodyDto.type.ts";

// Dernière étape du mot de passe oublié : le nouveau mot de passe remplace l'ancien, toutes les sessions du compte sont
// fermées, puis celle de ce navigateur est ouverte (flow null)
export interface SubmitNewPassword extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/flow/new-password`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: SubmitNewPasswordBodyDto;
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
					AuthErrorCodeEnum.PASSWORD_UNCHANGED | AuthErrorCodeEnum.FLOW_EXPIRED
			  >;
		// Trop de mots de passe à vérifier en même temps : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<AuthErrorCodeEnum.AUTH_BUSY>;
	};
}
