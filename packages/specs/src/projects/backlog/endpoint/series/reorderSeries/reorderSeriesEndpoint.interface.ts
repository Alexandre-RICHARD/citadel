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
import type { ReorderSeriesBodyDto } from "./reorderSeriesBodyDto.type.ts";
import type { ReorderSeriesPathParamDto } from "./reorderSeriesPathParamDto.type.ts";

// « Valider » de « Réorganiser la série » : le nouveau numéro de chacun de ses jeux du backlog, en une seule action
export interface ReorderSeries extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/series/:seriesId/entries`;
		method: HttpMethodEnum.PUT;
		protected: false;
		pathParams: ReorderSeriesPathParamDto;
		body: ReorderSeriesBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: SeriesEntryListDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.SERIES_NOT_FOUND>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.SERIES_ENTRIES_MISMATCH>;
	};
}
