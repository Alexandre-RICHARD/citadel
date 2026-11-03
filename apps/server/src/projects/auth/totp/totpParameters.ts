// Les réglages que toutes les applications d'authentification comprennent (Google Authenticator n'en lit pas d'autres) :
// HMAC-SHA-1, 6 chiffres, un code toutes les 30 secondes. Un secret de 20 octets, la taille d'un SHA-1 (RFC 4226, §4)
export const TOTP_PARAMETERS = {
	algorithm: "SHA1",
	digits: 6,
	periodSeconds: 30,
	secretBytes: 20,
} as const;
