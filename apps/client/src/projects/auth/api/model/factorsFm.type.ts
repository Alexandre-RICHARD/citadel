import type { FactorFm } from "./factorFm.type";

// La double authentification du compte : ses facteurs et ses codes de secours encore utilisables
export type FactorsFm = {
	factors: FactorFm[];
	remainingRecoveryCodes: number;
};
