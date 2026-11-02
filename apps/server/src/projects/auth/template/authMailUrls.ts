import { MAIL_SITE } from "../../../mail/mailSite.ts";

// Les pages de l'authentification où un mail renvoie. Le lien à jeton (`/auth/verify`) est celui du parcours : l'appelant
// le fournit
export const AUTH_MAIL_URLS = {
	login: `${MAIL_SITE.url}/auth/login`,
	forgotPassword: `${MAIL_SITE.url}/auth/forgot-password`,
};
