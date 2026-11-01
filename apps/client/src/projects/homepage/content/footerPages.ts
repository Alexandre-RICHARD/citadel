import { CONTACT_EMAIL } from "@citadel/specs/src/projects/contact/contactEmail";

import type { FooterPage } from "./footerPage.type";

// Les pages du footer, dans l'ordre de ses liens
export const footerPages: FooterPage[] = [
	{
		kind: "text",
		slug: "a-propos",
		title: "À propos",
		intro:
			"La Citadel d’Alex, c’est mon site perso : les outils que je construis pour moi, mis en ligne pour qui veut s’en servir.",
		sections: [
			{
				title: "Le site",
				paragraphs: [
					"Chaque projet est né d’un besoin à moi : compter mes morts dans les Souls, suivre mon backlog, savoir quand passe le tram. Cette page d’accueil les rassemble et les présente.",
					"C’est aussi mon terrain d’essai : architecture du front, design system, mise en production. Le site évolue au fil de mes envies, sans calendrier.",
				],
			},
			{
				title: "La stack",
				paragraphs: [
					"Le front est en React et TypeScript, construit avec Vite ; l’API en Node, avec Express ; la base en MariaDB. Le tout tient dans un monorepo pnpm, avec un design system partagé entre les projets.",
					"Une grande partie du code est écrite avec Claude, l’assistant d’Anthropic. Les idées, l’architecture et les choix sont les miens.",
				],
			},
			{
				title: "L’hébergement",
				paragraphs: [
					"Le site tourne chez moi, sur un NAS, dans des conteneurs Docker. Caddy reçoit les requêtes et s’occupe du HTTPS ; Cloudflare se place devant, pour protéger et accélérer le site.",
					"Chaque version est construite par GitHub, puis déployée sur le NAS après ma confirmation.",
				],
			},
			{
				title: "Le code source",
				paragraphs: [
					"Le code est public, sur GitHub : le lien est dans le pied de page. Il est sous licence MIT : libre de réutilisation, à condition de garder la mention de son auteur.",
				],
			},
		],
	},
	{
		kind: "contact",
		slug: "contact",
		title: "Contact",
		intro:
			"Une question sur un projet, une idée, un bug repéré ? Écrivez-moi : je lis chaque message.",
	},
	{
		kind: "text",
		slug: "mentions-legales",
		title: "Mentions légales",
		intro:
			"Les informations que la loi pour la confiance dans l’économie numérique (LCEN) demande à tout site de publier.",
		sections: [
			{
				title: "Éditeur du site",
				paragraphs: [
					`Alexandre RICHARD, particulier, Angers (49100), France. Contact : ${CONTACT_EMAIL}.`,
					"Directeur de la publication : Alexandre RICHARD.",
				],
			},
			{
				title: "Hébergement",
				paragraphs: [
					`Le site est auto-hébergé par son éditeur, Alexandre RICHARD, sur un serveur personnel situé à Angers (49100), France. Contact : ${CONTACT_EMAIL}.`,
				],
			},
			{
				title: "Nom de domaine et réseau",
				paragraphs: [
					"Le nom de domaine alexandre-richard.fr est enregistré chez O2Switch (France).",
					"Le trafic passe par Cloudflare, Inc. (États-Unis), qui gère le DNS du domaine et protège le site.",
				],
			},
			{
				title: "Propriété intellectuelle",
				paragraphs: [
					"Le code du site est publié sous licence MIT : on peut le réutiliser, le modifier et le redistribuer, à condition de conserver la mention de son auteur et la licence.",
					"Les noms, logos et images des jeux et du réseau de transport cités appartiennent à leurs détenteurs. Les données des jeux viennent d’IGDB, celles du réseau Irigo de ses données ouvertes, et le fond de carte des contributeurs d’OpenStreetMap.",
				],
			},
		],
	},
	{
		kind: "text",
		slug: "donnees-personnelles",
		title: "Données personnelles",
		intro:
			"Ce que le site garde sur vous, où, et pourquoi. En bref : pas de compte, pas de publicité, pas de mesure d’audience.",
		sections: [
			{
				title: "Ce que le navigateur garde",
				paragraphs: [
					"Quelques réglages restent dans votre navigateur, sans jamais partir vers le serveur : le thème clair ou sombre choisi pour chaque projet, la disposition des colonnes du Backlog, et les arrêts favoris, filtres et réglages d’Angers Irigo.",
					"Le temps d’une session, le site retient aussi que vous avez vu l’intro, pour ne pas la rejouer. Les réglages de votre navigateur permettent de tout effacer.",
				],
			},
			{
				title: "Le cookie de connexion",
				paragraphs: [
					"Il n’y a pas encore de comptes, donc aucun cookie. Quand la connexion arrivera, un cookie gardera votre session ouverte : il ne servira qu’à ça, et cette page sera mise à jour.",
				],
			},
			{
				title: "Le formulaire de contact",
				paragraphs: [
					"Un message envoyé depuis la page Contact part par mail vers ma boîte : son sujet, son texte et, si vous les donnez, votre nom et votre adresse. Il n’est enregistré nulle part sur le site, et je l’efface de ma boîte dans la semaine. Votre adresse ne sert qu’à vous répondre et à vous envoyer un accusé de réception.",
					"Pour limiter les abus, le serveur garde en mémoire, sans les écrire nulle part, votre adresse IP pendant une heure (un nombre de messages par heure) et votre adresse mail jusqu’au soir (un seul accusé de réception par jour). Base légale : votre demande de contact, et l’intérêt légitime à protéger le site.",
					"Les mails du site partent par Brevo, une société française, qui les voit donc passer. Brevo ajoute à chaque mail un pixel qui signale son ouverture et fait passer ses liens par son serveur : ce suivi est anonymisé, et je ne le consulte pas.",
				],
			},
			{
				title: "Les journaux du serveur",
				paragraphs: [
					"Chaque requête laisse une ligne dans les journaux du serveur : adresse IP, pays, date, page demandée et réponse. Ils servent à repérer les pannes et les accès suspects ; je suis seul à les lire.",
					"Ils sont effacés au bout de 90 jours au plus, et plus tôt pour un journal très bavard : le serveur ne garde que quelques dizaines de mégaoctets de chacun. Base légale : l’intérêt légitime à faire fonctionner et à protéger le site.",
				],
			},
			{
				title: "Cloudflare",
				paragraphs: [
					"Le site passe par Cloudflare, qui le protège des attaques et accélère son affichage. Cloudflare voit donc votre adresse IP et les pages demandées, et peut poser un cookie technique pour reconnaître les robots. Une partie de ses serveurs est aux États-Unis ; sa politique de confidentialité est sur cloudflare.com.",
				],
			},
			{
				title: "Les ressources tierces",
				paragraphs: [
					"Deux projets affichent des images venues d’autres sites, qui voient alors votre adresse IP : le Backlog charge ses jaquettes depuis IGDB, Angers Irigo son fond de carte depuis OpenStreetMap.",
					"Les données temps réel d’Irigo, elles, passent par le serveur du site : leur fournisseur ne voit pas votre adresse.",
				],
			},
			{
				title: "Vos droits",
				paragraphs: [
					`Le responsable du traitement est Alexandre RICHARD. Pour accéder à vos données, les corriger ou les faire effacer, écrivez à ${CONTACT_EMAIL}. En cas de désaccord, vous pouvez saisir la CNIL, sur cnil.fr.`,
				],
			},
		],
	},
];
