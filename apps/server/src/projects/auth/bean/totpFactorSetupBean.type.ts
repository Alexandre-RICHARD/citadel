// Un TOTP qui attend son premier code : le seul moment où son secret sort du serveur
export type TotpFactorSetupBean = {
	factorId: number;
	secretBase32: string;
	otpauthUri: string;
};
