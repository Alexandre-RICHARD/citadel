import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { SagaEntryListDto } from "../../../dto/saga/sagaEntryListDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { ReorderSagaBodyDto } from "./reorderSagaBodyDto.type.ts";
import type { ReorderSagaPathParamDto } from "./reorderSagaPathParamDto.type.ts";

// « Valider » de « Réorganiser la saga » : le nouveau numéro de chacun de ses médias du backlog, en une seule action
export interface ReorderSaga extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/sagas/:sagaId/entries`;
		method: HttpMethodEnum.PUT;
		protected: true;
		pathParams: ReorderSagaPathParamDto;
		body: ReorderSagaBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: SagaEntryListDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.SAGA_NOT_FOUND>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.SAGA_ENTRIES_MISMATCH>;
	};
}
