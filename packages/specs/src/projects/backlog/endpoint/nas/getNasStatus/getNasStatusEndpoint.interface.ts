import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { NasStatusDto } from "../../../dto/nas/nasStatusDto.type.ts";

// Le mode connecté est-il disponible et déverrouillé ? Toujours là, même sur le serveur public, qui répond non
export interface GetNasStatus extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/nas-status`;
		method: HttpMethodEnum.GET;
		protected: true;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: NasStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
	};
}
