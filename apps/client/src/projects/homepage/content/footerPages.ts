import { loremParagraphs } from "../../../common/placeholder/loremParagraphs";
import { buildPlaceholderSections } from "./buildPlaceholderSections";
import type { FooterPage } from "./footerPage.type";

// Les pages du footer, dans l'ordre de ses liens. Textes provisoires : les titres disent ce que chaque page couvrira
export const footerPages: FooterPage[] = [
	{
		slug: "a-propos",
		title: "À propos",
		intro: loremParagraphs[4],
		sections: buildPlaceholderSections([
			"Le site",
			"La stack",
			"L’hébergement",
			"Le code source",
		]),
	},
	{
		slug: "mentions-legales",
		title: "Mentions légales",
		intro: loremParagraphs[0],
		sections: buildPlaceholderSections([
			"Propriétaire du site",
			"Hébergement",
			"Nom de domaine et réseau",
			"Propriété intellectuelle",
		]),
	},
	{
		slug: "donnees-personnelles",
		title: "Données personnelles",
		intro: loremParagraphs[2],
		sections: buildPlaceholderSections([
			"Ce que le navigateur garde",
			"Le cookie de connexion",
			"Les journaux du serveur",
			"Cloudflare",
			"Les ressources tierces",
			"Vos droits",
		]),
	},
];
