import type { FooterPage } from "../content/footerPage.type";
import { getProjectSlug } from "./getProjectSlug";
import type { HomepageView } from "./homepageView.type";
import type { ShowcaseProject } from "./showcaseProject.type";

// /homepage → l'accueil ; /homepage/<slug> → un projet de la roue, ou une page du footer
export function resolveHomepageView(
	slug: string | undefined,
	showcaseProjects: ShowcaseProject[],
	footerPages: FooterPage[],
): HomepageView {
	if (!slug) return { kind: "welcome" };

	const project = showcaseProjects.find(
		(candidate) => getProjectSlug(candidate) === slug,
	);
	if (project) return { kind: "project", project };

	const page = footerPages.find((candidate) => candidate.slug === slug);
	if (page) return { kind: "page", page };

	return { kind: "unknown" };
}
