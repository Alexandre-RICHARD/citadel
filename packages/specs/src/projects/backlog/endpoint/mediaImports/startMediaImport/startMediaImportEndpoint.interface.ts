import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { MediaImportDto } from "../../../dto/mediaImport/mediaImportDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { StartMediaImportBodyDto } from "./startMediaImportBodyDto.type.ts";

// Import de liste (§7.2) : le serveur lit les fiches sur TMDB à son rythme, sans rien enregistrer avant « Valider »
export interface StartMediaImport extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/media-imports`;
		method: HttpMethodEnum.POST;
		protected: true;
		body: StartMediaImportBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: MediaImportDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.MEDIA_IMPORT_ALREADY_RUNNING>;
	};
}
