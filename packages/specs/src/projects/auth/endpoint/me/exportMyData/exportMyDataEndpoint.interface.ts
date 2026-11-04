import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";

/**
 * Les données du compte connecté : un ZIP avec un CSV par table, toutes les lignes de l'utilisateur, aucun secret (ni
 * hash, ni empreinte, ni secret TOTP). Un GET sans effet : le navigateur le télécharge par un simple lien, le cookie de
 * session suffit
 */
export interface ExportMyData extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/me/export`;
		method: HttpMethodEnum.GET;
		protected: true;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		// Le fichier ZIP, en pièce jointe (application/zip)
		data: Blob;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
