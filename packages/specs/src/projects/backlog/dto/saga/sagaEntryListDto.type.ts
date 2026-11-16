import type { SagaEntryDto } from "./sagaEntryDto.type.ts";

// Les médias du backlog d'une saga, par numéro
export type SagaEntryListDto = {
	entries: SagaEntryDto[];
};
