// Longueurs des champs de l'authentification, en caractères (points de code, comme MariaDB les compte) : celles des
// colonnes d'auth_user et d'auth_factor, le mot de passe compté après sa normalisation NFC, les codes en chiffres, le
// code de secours sans son tiret
export const AUTH_FIELD_LENGTHS = {
	usernameMax: 64,
	displayNameMax: 64,
	emailMax: 254,
	passwordMin: 12,
	passwordMax: 128,
	mailCode: 6,
	totpCode: 6,
	factorNameMax: 50,
	recoveryCode: 10,
	// Un code de secours s'affiche en deux groupes, « ABCDE-FGHIJ »
	recoveryCodeGroup: 5,
};
