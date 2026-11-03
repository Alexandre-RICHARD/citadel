import type { FactorListDto } from "@citadel/specs/src/projects/auth/dto/factorListDto.type.ts";

import type { FactorListBean } from "../../../bean/factorListBean.type.ts";

export function fromFactorListBeanToFactorListDto({
	factors,
	remainingRecoveryCodes,
}: FactorListBean): FactorListDto {
	return {
		factors: factors.map((factor) => ({
			id: factor.id,
			type: factor.type,
			name: factor.name,
			createdAt: factor.createdAt.toISOString(),
			lastUsedAt: factor.lastUsedAt?.toISOString() ?? null,
		})),
		remainingRecoveryCodes,
	};
}
