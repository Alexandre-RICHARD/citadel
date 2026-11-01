import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { MailStatusDto } from "../../../dto/mailStatusDto.type.ts";

// Lu par le front au chargement : formulaire de contact (puis inscription) désactivé et bandeau quand le quota l'arrête
export interface GetMailStatus extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.MAIL}/status`;
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: MailStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
