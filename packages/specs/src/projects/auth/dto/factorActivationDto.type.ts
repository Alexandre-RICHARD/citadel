// Un facteur vient d'être activé. S'il est le premier du compte, ses codes de secours, montrés cette seule fois ; null
// sinon (les codes existants restent valables)
export type FactorActivationDto = {
	recoveryCodes: string[] | null;
};
