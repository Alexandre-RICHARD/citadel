import type { ErrorResponseDto } from "./errorResponseDto.type.ts";
import type { TechnicalErrorCodeEnum } from "./technicalErrorCode.enum.ts";

export type InternalErrorResponseDto =
	ErrorResponseDto<TechnicalErrorCodeEnum.INTERNAL_ERROR>;
