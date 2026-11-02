import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ContactUnsentRetryDto } from "../../../dto/contactUnsentRetryDto.type.ts";

// Lancé chaque soir par le job contact-retry d'infra-ops, qui appelle le serveur depuis son conteneur : une requête
// passée par Caddy reçoit une 404. Renvoie, un par un, les messages gardés en base tant que le quota le permet : la
// notification d'origine (même contenu, sujet suivi de « (différé) »), puis l'accusé de réception, avec sa mention du retard
export interface RetryContactUnsent extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.CONTACT}/unsent/retry`;
		method: HttpMethodEnum.POST;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: ContactUnsentRetryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
