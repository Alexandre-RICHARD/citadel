// Un TOTP à activer : sa clé et son adresse otpauth://, montrées une seule fois pour être scannées ou saisies à la main
export type TotpSetupFm = {
	factorId: number;
	secret: string;
	otpauthUri: string;
};
