import type { FooterPage } from "../content/footerPage.type";
import type { ShowcaseProject } from "./showcaseProject.type";

// Ce que l'adresse demande d'afficher
export type HomepageView =
	| { kind: "welcome" }
	| { kind: "project"; project: ShowcaseProject }
	| { kind: "page"; page: FooterPage }
	| { kind: "unknown" };
