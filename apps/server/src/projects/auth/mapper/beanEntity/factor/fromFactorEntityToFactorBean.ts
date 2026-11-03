import type { FactorBean } from "../../../bean/factorBean.type.ts";
import type { Factor } from "../../../models/Factor.ts";

// Jamais le secret, ni sa version de clé, ni le dernier pas
export function fromFactorEntityToFactorBean(
	factor: Pick<Factor, "id" | "type" | "name" | "createdAt" | "lastUsedAt">,
): FactorBean {
	return {
		id: factor.id,
		type: factor.type,
		name: factor.name,
		createdAt: factor.createdAt,
		lastUsedAt: factor.lastUsedAt,
	};
}
