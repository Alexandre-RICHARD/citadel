export enum E2EUrlEnum {
	// Le site de `pnpm stack-up` (Caddy de prod:local, certificat de test)
	SITE_URL = "https://citadel.localhost:8443",
	// Les pages du site (chemins, relatifs à SITE_URL)
	HOME = "/",
	HOMEPAGE = "/homepage",
	// Les pages du pied de page
	FOOTER_ABOUT = "/homepage/a-propos",
	FOOTER_CONTACT = "/homepage/contact",
	FOOTER_LEGAL_NOTICE = "/homepage/mentions-legales",
	FOOTER_PERSONAL_DATA = "/homepage/donnees-personnelles",
	BACKLOG = "/backlog",
	GAME_DEATH_COUNTER = "/game-death-counter",
	SATISFACTORY = "/satisfactory",
	IRIGO = "/angers-irigo",
	AUTH_LOGIN = "/auth/login",
	AUTH_REGISTER = "/auth/register",
	AUTH_FORGOT_PASSWORD = "/auth/forgot-password",
	// Où mène le lien des mails
	AUTH_VERIFY = "/auth/verify",
	AUTH_PROFILE = "/auth/profile",
	AUTH_SECURE_ACCOUNT = "/auth/secure-account",
	// La boîte de réception de tous les mails du site, à ouvrir dans un navigateur
	MAILPIT_UI = "http://localhost:8025",
	MAILPIT_API = "http://127.0.0.1:8025/api/v1",
}
