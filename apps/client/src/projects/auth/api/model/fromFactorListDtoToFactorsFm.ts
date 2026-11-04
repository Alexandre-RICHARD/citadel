import type { FactorListDto } from "@citadel/specs/src/projects/auth/dto/factorListDto.type";

import type { FactorsFm } from "./factorsFm.type";

export function fromFactorListDtoToFactorsFm(dto: FactorListDto): FactorsFm {
	return {
		factors: dto.factors.map((factor) => ({
			id: factor.id,
			type: factor.type,
			name: factor.name,
			createdAt: Date.parse(factor.createdAt),
			lastUsedAt:
				factor.lastUsedAt === null ? null : Date.parse(factor.lastUsedAt),
		})),
		remainingRecoveryCodes: dto.remainingRecoveryCodes,
	};
}
