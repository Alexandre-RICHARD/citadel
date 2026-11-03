import type { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";

// Un second facteur actif, sans rien de son secret
export type FactorBean = {
	id: number;
	type: FactorTypeEnum;
	name: string;
	createdAt: Date;
	lastUsedAt: Date | null;
};
