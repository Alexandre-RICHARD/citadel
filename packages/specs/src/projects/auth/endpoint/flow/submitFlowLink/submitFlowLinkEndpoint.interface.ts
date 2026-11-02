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
import type { SubmitFlowLinkBodyDto } from "./submitFlowLinkBodyDto.type.ts";

// Le lien reçu par mail, envoyé par le clic de confirmation de /auth/verify (les antivirus de messagerie ouvrent les liens
// pour les analyser : un GET ne valide jamais rien). Il ne marche que dans le navigateur qui a commencé le parcours :
// sinon, un inconnu qui lance une connexion avec ton email serait connecté par ton clic
export interface SubmitFlowLink extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/flow/link`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: SubmitFlowLinkBodyDto;
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
					AuthErrorCodeEnum.LINK_OTHER_BROWSER | AuthErrorCodeEnum.FLOW_EXPIRED
			  >;
		// Inscription : pseudo pris entre la demande et la confirmation ; le lien reste valable avec un autre pseudo
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<
			AuthErrorCodeEnum.USERNAME_TAKEN | AuthErrorCodeEnum.EMAIL_TAKEN
		>;
	};
}
