import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ShowUpdateListDto } from "../../../dto/showUpdate/showUpdateListDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";

// « Récupérer les nouveautés des séries » : relit sur TMDB les séries en cours du backlog, sans rien enregistrer
export interface GetShowUpdates extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/show-updates`;
		method: HttpMethodEnum.GET;
		protected: true;
	};
	response:
		| {
				status: HttpStatutCodeSuccessEnum.SUCCESS;
				data: ShowUpdateListDto;
		  }
		| {
				status: HttpStatutCodeSuccessEnum.NO_CONTENT;
				data: null;
		  };
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_GATEWAY]: ErrorResponseDto<BacklogErrorCodeEnum.TMDB_UNAVAILABLE>;
	};
}
