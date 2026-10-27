import type { ProjectDictionary } from "../../../react/appNavigation/projectDictionary.type";
import { projects } from "../../../react/appNavigation/projectsDictionary";
import type { ProjectShowcase } from "../../../react/appNavigation/showcase/projectShowcase.type";
import type { ShowcaseProject } from "./showcaseProject.type";

function hasShowcase(
	project: ProjectDictionary,
): project is ProjectDictionary & { showcase: ProjectShowcase } {
	return project.showcase !== null;
}

// Les projets de la roue, dans l'ordre de leurs fiches : tous ceux qui ont une présentation
export const showcaseProjects: ShowcaseProject[] =
	Object.values(projects).filter(hasShowcase);
