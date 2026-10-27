import type { FooterPageSection } from "./footerPageSection.type";

// Une page du footer, affichée dans le conteneur principal : /homepage/<slug>
export type FooterPage = {
	slug: string;
	title: string;
	intro: string;
	sections: FooterPageSection[];
};
