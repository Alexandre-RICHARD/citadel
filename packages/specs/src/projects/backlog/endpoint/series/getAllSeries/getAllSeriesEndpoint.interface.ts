import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { SeriesListDto } from "../../../dto/series/seriesListDto.type.ts";

// Toutes les séries de la base, pour choisir « une autre série »
export interface GetAllSeries extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/series`;
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response:
		| {
				status: HttpStatutCodeSuccessEnum.SUCCESS;
				data: SeriesListDto;
		  }
		| {
				status: HttpStatutCodeSuccessEnum.NO_CONTENT;
				data: null;
		  };
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
