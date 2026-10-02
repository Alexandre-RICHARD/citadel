import type { HttpStatutCodeErrorEnum } from "../httpStatutCodeError.enum.ts";
import type { ErrorResponseDto } from "./errorResponseDto.ts";

export type ResponseStatusErrorMap = Partial<
	Record<HttpStatutCodeErrorEnum, ErrorResponseDto>
>;
