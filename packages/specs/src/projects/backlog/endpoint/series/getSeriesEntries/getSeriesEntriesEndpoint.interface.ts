import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { SeriesEntryListDto } from "../../../dto/series/seriesEntryListDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { GetSeriesEntriesPathParamDto } from "./getSeriesEntriesPathParamDto.type.ts";

// Les jeux du backlog d'une série, par numéro : numéro pré-rempli, numéro déjà pris, « Réorganiser la série »
export interface GetSeriesEntries extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/series/:seriesId/entries`;
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: GetSeriesEntriesPathParamDto;
	};
	response:
		| {
				status: HttpStatutCodeSuccessEnum.SUCCESS;
				data: SeriesEntryListDto;
		  }
		| {
				status: HttpStatutCodeSuccessEnum.NO_CONTENT;
				data: null;
		  };
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.SERIES_NOT_FOUND>;
	};
}
