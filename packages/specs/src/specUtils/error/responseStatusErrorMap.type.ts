import type { HttpStatutCodeErrorEnum } from "../httpStatutCodeError.enum.ts";
import type { ErrorResponseDto } from "./errorResponseDto.type.ts";

export type ResponseStatusErrorMap = Partial<
	Record<HttpStatutCodeErrorEnum, ErrorResponseDto>
>;
