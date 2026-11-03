import type { FactorTypeEnum } from "../enum/factorType.enum.ts";

// Un second facteur actif du compte. Dates ISO 8601, à afficher
export type FactorDto = {
	id: number;
	type: FactorTypeEnum;
	name: string;
	createdAt: string;
	// null : jamais utilisé pour se connecter
	lastUsedAt: string | null;
};
