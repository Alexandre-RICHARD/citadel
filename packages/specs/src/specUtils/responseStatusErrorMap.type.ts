import type { HttpStatutCodeErrorEnum } from "./httpStatutCodeError.enum.ts";

export type ResponseStatusErrorMap = Partial<
	Record<HttpStatutCodeErrorEnum, unknown>
>;
