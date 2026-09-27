import type { HttpStatutCodeErrorEnum } from "../httpStatutCodeError.enum.ts";
import type { ErrorResponseDto } from "./errorResponse.dto.ts";

export type ResponseStatusErrorMap = Partial<
	Record<HttpStatutCodeErrorEnum, ErrorResponseDto>
>;
