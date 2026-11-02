import { CONTACT_EMAIL } from "@citadel/specs/src/projects/contact/contactEmail";

/**
 * Tous les liens vers l'extérieur de l'application, à un seul endroit : un lien qui meurt se corrige ici, et un coup
 * d'œil de temps en temps suffit à les contrôler. Le texte des pages du footer y renvoie par la clé
 * (« [Cloudflare](cloudflare) »). On pointe la page utile (politique de confidentialité, formulaire de plainte,
 * licence) plutôt que l'accueil du site quand c'est elle que le texte évoque.
 *
 * Contrôle automatique : `pnpm tools checkExternalLinks` (IGDB répond 403 aux outils automatiques, mais s'ouvre dans un navigateur).
 * Dernier contrôle : 2 novembre 2026
 */
export const externalLinks = {
	// Écrire à l'éditeur du site (aucun site à contrôler)
	contactMail: `mailto:${CONTACT_EMAIL}`,

	// Le code du site
	repository: "https://github.com/Alexandre-RICHARD/citadel",
	repositoryLicense:
		"https://github.com/Alexandre-RICHARD/citadel/blob/main/LICENSE",

	// Les outils du site
	claude: "https://claude.com/product/overview",
	anthropic: "https://www.anthropic.com/",
	react: "https://react.dev/",
	typescript: "https://www.typescriptlang.org/",
	vite: "https://vite.dev/",
	nodejs: "https://nodejs.org/en",
	express: "https://expressjs.com/",
	mariadb: "https://mariadb.org/",
	pnpm: "https://pnpm.io/",
	docker: "https://www.docker.com/",
	caddy: "https://caddyserver.com/",
	githubActions: "https://docs.github.com/en/actions",

	// Les services par lesquels passent les visiteurs ou leurs données
	cloudflare: "https://www.cloudflare.com/",
	cloudflarePrivacy: "https://www.cloudflare.com/privacypolicy/",
	o2switch: "https://www.o2switch.fr/",
	brevo: "https://www.brevo.com/",
	brevoPrivacy: "https://www.brevo.com/legal/privacypolicy/",

	// Les données des projets
	igdb: "https://www.igdb.com/",
	twitchPrivacy: "https://legal.twitch.com/legal/privacy-notice/",
	openStreetMapCopyright: "https://www.openstreetmap.org/copyright",
	openStreetMapPrivacy: "https://osmfoundation.org/wiki/Privacy_Policy",
	irigo: "https://www.irigo.fr/",
	irigoOpenData: "https://transport.data.gouv.fr/datasets?q=irigo",

	// Les recours : le formulaire de réclamation de la CNIL
	cnilComplaint: "https://www.cnil.fr/fr/plaintes",
} as const;
