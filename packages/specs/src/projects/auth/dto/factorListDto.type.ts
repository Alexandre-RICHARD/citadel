import type { FactorDto } from "./factorDto.type.ts";

// La double authentification du compte : ses facteurs actifs, du plus ancien au plus récent, et ses codes de secours
// encore utilisables (jamais les codes eux-mêmes, montrés une seule fois à leur création)
export type FactorListDto = {
	factors: FactorDto[];
	remainingRecoveryCodes: number;
};
