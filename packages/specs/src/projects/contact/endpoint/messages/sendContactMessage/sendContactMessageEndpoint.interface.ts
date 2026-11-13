import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { TooManyRequestsResponseDto } from "../../../../../specUtils/error/tooManyRequestsResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { MailErrorCodeEnum } from "../../../../mail/error/mailErrorCode.enum.ts";
import type { ContactMessageReceiptDto } from "../../../dto/contactMessageReceiptDto.type.ts";
import type { ContactErrorCodeEnum } from "../../../error/contactErrorCode.enum.ts";
import type { SendContactMessageBodyDto } from "./sendContactMessageBodyDto.type.ts";

// Le formulaire de contact : une notification à `contact`, et un accusé de réception au visiteur s'il a donné son
// adresse (un par adresse et par jour). Si la notification ne peut pas partir, le message est gardé en base (le visiteur
// a une réponse 200) ; la réponse dit aussi ce qu'il est advenu de l'accusé
export interface SendContactMessage extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.CONTACT}/messages`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: SendContactMessageBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: ContactMessageReceiptDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		// Le quota quotidien d'emails a fermé le formulaire
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<ContactErrorCodeEnum.CONTACT_CLOSED>;
		// Trop de messages depuis cette IP : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: TooManyRequestsResponseDto;
		// Le fournisseur n'a pas pris la notification, et la base n'a pas pu garder le message : rien n'est gardé
		[HttpStatutCodeErrorEnum.BAD_GATEWAY]: ErrorResponseDto<MailErrorCodeEnum.MAIL_UNAVAILABLE>;
	};
}
