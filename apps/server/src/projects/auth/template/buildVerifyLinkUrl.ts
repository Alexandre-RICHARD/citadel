import { MAIL_SITE } from "../../../mail/mailSite.ts";

// Le jeton voyage dans le fragment (#…), que le navigateur n'envoie jamais à un serveur : ni Caddy ni aucun relais ne
// l'écrit dans ses journaux. La page /auth/verify le lit, puis l'envoie au clic de confirmation
export function buildVerifyLinkUrl(linkToken: string): string {
	return `${MAIL_SITE.url}/auth/verify#${linkToken}`;
}
