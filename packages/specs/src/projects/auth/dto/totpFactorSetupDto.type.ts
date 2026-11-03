// Un TOTP qui attend son premier code. Le secret n'est donné qu'ici, une seule fois : le QR code se fait dans le
// navigateur à partir de l'URI, la clé en Base32 se saisit à la main
export type TotpFactorSetupDto = {
	factorId: number;
	secret: string;
	otpauthUri: string;
};
