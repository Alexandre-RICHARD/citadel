import { TOTP_PARAMETERS } from "./totpParameters.ts";

type OtpauthAccount = {
	issuer: string;
	// Ce qui distingue le compte dans l'application : l'email
	accountName: string;
	secretBase32: string;
};

/**
 * L'URI que le QR code transporte (format « Key Uri » de Google Authenticator, que lisent aussi Aegis et Bitwarden).
 * L'émetteur figure deux fois, en préfixe du libellé et en paramètre : les applications anciennes ne lisent que l'un
 */
export function buildOtpauthUri({
	issuer,
	accountName,
	secretBase32,
}: OtpauthAccount): string {
	const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}`;
	const parameters = new URLSearchParams({
		secret: secretBase32,
		issuer,
		algorithm: TOTP_PARAMETERS.algorithm,
		digits: String(TOTP_PARAMETERS.digits),
		period: String(TOTP_PARAMETERS.periodSeconds),
	});
	return `otpauth://totp/${label}?${parameters.toString()}`;
}
