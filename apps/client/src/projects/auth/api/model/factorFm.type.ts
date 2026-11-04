import type { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum";

// Un second facteur actif du compte, ses dates en heure du navigateur (millisecondes)
export type FactorFm = {
	id: number;
	type: FactorTypeEnum;
	name: string;
	createdAt: number;
	// null : jamais utilisé pour se connecter
	lastUsedAt: number | null;
};
