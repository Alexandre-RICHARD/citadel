import type { FooterPageSection } from "./footerPageSection.type";

// Une page du footer, affichée dans le conteneur principal : /homepage/<slug>. Du texte en sections, ou le formulaire
// de contact
export type FooterPage = {
	slug: string;
	title: string;
	intro: string;
} & ({ kind: "text"; sections: FooterPageSection[] } | { kind: "contact" });
