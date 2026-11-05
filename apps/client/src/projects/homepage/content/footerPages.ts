import { CONTACT_MAIL_LINK } from "./contactMailLink";
import type { FooterPage } from "./footerPage.type";

// Le texte des pages s'écrit avec des liens « [texte](clé) » : la clé est celle du dictionnaire des liens externes
// (common/links/externalLinks.ts)

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
					"Chaque projet est né d’un besoin à moi : compter mes morts dans les jeux Souls, suivre mon backlog, savoir quand passe le tram. Cette page d’accueil les rassemble et les présente.",
					"C’est aussi mon terrain d’essai : architecture du front, design system, mise en production. Le site évolue au fil de mes envies, sans calendrier.",
				],
			},
			{
				title: "La stack",
				paragraphs: [
					"Le front est en [React](react) et [TypeScript](typescript), construit avec [Vite](vite) ; l’API en [Node](nodejs), avec [Express](express) ; la base en [MariaDB](mariadb). Le tout tient dans un monorepo [pnpm](pnpm), avec un design system partagé entre les projets.",
					"Une grande partie du code est écrite avec [Claude](claude), l’assistant d’[Anthropic](anthropic). Les idées, l’architecture et les choix sont les miens.",
				],
			},
			{
				title: "L’hébergement",
				paragraphs: [
					"Le site est auto-hébergé, dans des conteneurs [Docker](docker). [Caddy](caddy) reçoit les requêtes et s’occupe du HTTPS ; [Cloudflare](cloudflare) se place devant, pour protéger et accélérer le site.",
					"Chaque version est construite par [GitHub Actions](githubActions), puis déployée après ma confirmation.",
				],
			},
			{
				title: "Le code source",
				paragraphs: [
					"Le code est public, [sur GitHub](repository). Il est sous [licence MIT](repositoryLicense) : libre de réutilisation, à condition de garder la mention de son auteur.",
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
					`Alexandre RICHARD, particulier, Angers (49100), France. Contact : ${CONTACT_MAIL_LINK}.`,
					"Directeur de la publication : Alexandre RICHARD.",
				],
			},
			{
				title: "Hébergement",
				paragraphs: [
					`Le site est auto-hébergé : son éditeur, Alexandre RICHARD, en assure lui-même l’hébergement. Contact : ${CONTACT_MAIL_LINK}.`,
				],
			},
			{
				title: "Nom de domaine et réseau",
				paragraphs: [
					"Le nom de domaine alexandre-richard.fr est enregistré chez [O2Switch](o2switch) (France).",
					"Le trafic passe par [Cloudflare, Inc.](cloudflare) (États-Unis), qui gère le DNS du domaine et protège le site.",
				],
			},
			{
				title: "Propriété intellectuelle",
				paragraphs: [
					"Le code du site est publié sous [licence MIT](repositoryLicense) : on peut le réutiliser, le modifier et le redistribuer, à condition de conserver la mention de son auteur et la licence.",
					"Les noms, logos et images des jeux et du réseau de transport cités appartiennent à leurs détenteurs. Les données des jeux viennent d’[IGDB](igdb), celles du réseau [Irigo](irigo) de ses [données ouvertes](irigoOpenData), et le fond de carte des contributeurs d’[OpenStreetMap](openStreetMapCopyright).",
				],
			},
		],
	},
	{
		kind: "text",
		slug: "donnees-personnelles",
		title: "Données personnelles",
		intro:
			"Ce que le site garde sur vous, où, combien de temps et pourquoi. En bref : pas de publicité, pas de mesure d’audience, rien de plus que ce que demandent votre compte et vos projets.",
		sections: [
			{
				title: "Votre compte",
				paragraphs: [
					"Un compte n’est utile que pour les projets privés, Game Death Counter et Backlog. Il garde votre adresse email, votre pseudo et votre pseudo affiché, la date de vos dernières connexions et une empreinte de votre mot de passe (Argon2id) : le mot de passe lui-même n’est jamais enregistré. Ni nom ni prénom ne sont demandés.",
					"Si vous activez la double authentification, le compte garde aussi le secret de votre application d’authentification, chiffré, et une empreinte de chacun de vos codes de secours. Vos données dans les projets (jeux, boss, morts, backlog) sont rattachées au compte.",
					"Tout cela vit tant que le compte existe. Base légale : l’exécution du service que vous demandez en créant le compte.",
				],
			},
			{
				title: "La sécurité des comptes",
				paragraphs: [
					"Chaque session ouverte garde le navigateur et le système utilisés, une adresse IP tronquée (sa fin effacée : elle ne désigne plus qu’un morceau du réseau, pas votre connexion) et ses dates. Elle est effacée 30 jours au plus après la connexion ; votre profil liste vos sessions et permet de les fermer.",
					"Un journal de sécurité note les connexions, les échecs, les changements de mot de passe, d’email ou de double authentification, avec la même adresse IP tronquée : il est effacé au bout de 20 jours. Une inscription, une connexion par email ou un mot de passe oublié en cours ne sont gardés que quelques minutes.",
					"Base légale : l’intérêt légitime à protéger les comptes.",
				],
			},
			{
				title: "Ce que le navigateur garde",
				paragraphs: [
					"Quelques réglages restent dans votre navigateur, sans jamais partir vers le serveur : le thème clair ou sombre choisi pour chaque projet, la disposition des colonnes du Backlog, les arrêts favoris, filtres et réglages d’Angers Irigo, et le bandeau d’information du site une fois fermé.",
					"Le temps d’un onglet, le site retient aussi que vous avez vu l’intro, pour ne pas la rejouer, et les champs d’un formulaire du compte en cours, pour ne pas les perdre en rechargeant la page ou en revenant de votre boîte mail. Jamais un mot de passe. Les réglages de votre navigateur permettent de tout effacer.",
				],
			},
			{
				title: "Les cookies",
				paragraphs: [
					"Le site dépose deux cookies, seulement pour la connexion. Le cookie de session vous garde connecté : il disparaît à la fermeture du navigateur ou, avec « Se souvenir de moi », après 7 jours sans visite et 30 jours au plus. Le cookie de parcours lie une inscription, une connexion par email ou un mot de passe oublié au navigateur qui l’a commencé, le temps de ce parcours.",
					"Strictement nécessaires au service que vous demandez, ils ne demandent pas votre consentement. [Cloudflare](cloudflare) peut en poser un autre, technique, pour reconnaître les robots (voir plus bas).",
				],
			},
			{
				title: "Les polices de caractères",
				paragraphs: [
					"Les polices du site sont servies par son propre serveur : votre navigateur ne les télécharge pas chez un hébergeur de polices externe, et n’envoie donc pas votre adresse IP à un tiers pour les afficher.",
				],
			},
			{
				title: "Le formulaire de contact",
				paragraphs: [
					"Un message envoyé depuis la page Contact part par email vers ma boîte : son sujet, son texte et, si vous les donnez, votre nom et votre adresse email. Il n’est pas enregistré sur le site, sauf si l’envoi de l’email échoue : il est alors gardé dans la base du site, avec ce que vous avez saisi mais sans votre adresse IP. Son envoi est retenté chaque soir, et il en est effacé dès qu’il est parti. Je l’efface aussi de ma boîte dans la semaine. Votre adresse email ne sert qu’à vous répondre et à vous envoyer un accusé de réception.",
					"Pour limiter les abus, le serveur garde en mémoire, sans les écrire nulle part, votre adresse IP pendant une heure (un nombre de messages par heure) et votre adresse email jusqu’au soir (un seul accusé de réception par jour). Base légale : votre demande de contact, et l’intérêt légitime à protéger le site.",
				],
			},
			{
				title: "Les emails du site",
				paragraphs: [
					"Les codes et liens de connexion, les avis de sécurité du compte et les accusés de réception du formulaire de contact sont envoyés par [Brevo](brevo), une société française, qui les voit donc passer et garde la trace de ses envois (adresse, objet, ouverture) pendant 1 mois, puis l’efface : voir [sa politique de confidentialité](brevoPrivacy).",
					"Brevo ajoute à chaque email un pixel, une image invisible qui signale à Brevo que l’email a été ouvert, et fait passer ses liens par son serveur. L’offre que j’utilise ne permet pas de le désactiver. Brevo indique que ce suivi reste anonyme ; je ne consulte pas ces ouvertures et ne m’en sers pas. Pour qu’aucune ouverture ne soit signalée, vous pouvez désactiver l’affichage des images dans votre messagerie : les codes et les liens restent lisibles.",
				],
			},
			{
				title: "Les journaux du serveur",
				paragraphs: [
					"Chaque requête laisse une ligne dans les journaux du serveur : adresse IP, pays, date, page demandée et réponse. Ils servent à repérer les pannes et les accès suspects ; je suis seul à les lire.",
					"Ils sont effacés au bout de 90 jours au plus, et plus tôt pour un journal très fourni : le serveur ne garde que quelques dizaines de mégaoctets de chacun. Les erreurs du serveur sont notées à part, sans mot de passe ni adresse email, et effacées au bout de 20 jours. Base légale : l’intérêt légitime à faire fonctionner et à protéger le site.",
				],
			},
			{
				title: "Les sauvegardes",
				paragraphs: [
					"La base du site est sauvegardée chaque nuit, et la plus ancienne sauvegarde a moins de 10 semaines. Si l’une d’elles devait être restaurée, un journal tenu à part, gardé 10 semaines lui aussi, refait aussitôt les suppressions et les changements d’email survenus depuis : rien de ce que vous avez supprimé ne revient.",
					"La règle du site : aucune donnée temporaire ou supprimée ne survit plus de 3 mois, où qu’elle soit (base, journaux, sauvegardes).",
				],
			},
			{
				title: "Cloudflare",
				paragraphs: [
					"Le site passe par [Cloudflare](cloudflare), qui le protège des attaques et accélère son affichage. Cloudflare voit donc votre adresse IP et les pages demandées, et peut poser un cookie technique pour reconnaître les robots. Une partie de ses serveurs est aux États-Unis : ces transferts s’appuient sur le cadre de protection des données entre l’Union européenne et les États-Unis, auquel Cloudflare adhère. Ce qu’il en fait est détaillé dans [sa politique de confidentialité](cloudflarePrivacy).",
				],
			},
			{
				title: "Les ressources tierces",
				paragraphs: [
					"Deux projets affichent des images venues d’autres sites, qui voient alors votre adresse IP : le Backlog charge ses jaquettes depuis [IGDB](igdb), un service de Twitch ([politique de confidentialité de Twitch](twitchPrivacy)), et Angers Irigo son fond de carte depuis [OpenStreetMap](openStreetMapCopyright) ([politique de confidentialité de la fondation OpenStreetMap](openStreetMapPrivacy)).",
					"Les données temps réel d’[Irigo](irigo), elles, passent par le serveur du site : leur fournisseur ne voit pas votre adresse IP.",
				],
			},
			{
				title: "Vos droits",
				paragraphs: [
					"Depuis votre profil, sans rien demander à personne : télécharger toutes les données de votre compte (un fichier ZIP), corriger votre email ou votre pseudo affiché, vider un projet, ou supprimer le compte entier, immédiatement et définitivement.",
					`Le responsable du traitement est Alexandre RICHARD. Pour tout le reste (une question, une donnée sans compte comme un message de contact), écrivez à ${CONTACT_MAIL_LINK}. En cas de désaccord, vous pouvez adresser une [réclamation à la CNIL](cnilComplaint), le régulateur français, directement en ligne.`,
				],
			},
		],
	},
];
