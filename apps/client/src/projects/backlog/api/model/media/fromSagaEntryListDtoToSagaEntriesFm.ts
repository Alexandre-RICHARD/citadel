import type { SagaEntryListDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaEntryListDto.type";

import type { SagaEntryFm } from "./sagaEntryFm.type";

// Les médias d'une saga, par numéro : la liste suit les numéros posés de façon optimiste
export function fromSagaEntryListDtoToSagaEntriesFm(
	data: SagaEntryListDto,
): SagaEntryFm[] {
	return data.entries
		.map((entry) => ({
			...entry,
			originalTitle:
				entry.originalTitle === entry.title ? null : entry.originalTitle,
		}))
		.toSorted((first, second) => first.sagaNumber - second.sagaNumber);
}
