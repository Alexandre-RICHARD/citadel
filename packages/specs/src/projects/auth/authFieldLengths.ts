// Longueurs des champs de l'authentification, en caractères (points de code, comme MariaDB les compte) : celles des
// colonnes d'auth_user, le mot de passe compté après sa normalisation NFC, le code reçu par mail en chiffres
export const AUTH_FIELD_LENGTHS = {
	usernameMax: 64,
	displayNameMax: 64,
	emailMax: 254,
	passwordMin: 12,
	passwordMax: 128,
	mailCode: 6,
};
