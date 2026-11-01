import type { ErrorResponseDto } from "./errorResponseDto.type.ts";
import type { TechnicalErrorCodeEnum } from "./technicalErrorCode.enum.ts";

// Corps d'une réponse 429 ; le délai avant de réessayer est dans l'en-tête Retry-After, en secondes
export type TooManyRequestsResponseDto =
	ErrorResponseDto<TechnicalErrorCodeEnum.TOO_MANY_REQUESTS>;
