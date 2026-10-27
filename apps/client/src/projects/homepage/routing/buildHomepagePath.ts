import { ProjectsEnum } from "../../../react/appNavigation/projects.enum";
import { projects } from "../../../react/appNavigation/projectsDictionary";

// Adresse d'un projet sélectionné ou d'une page du footer ; sans slug, l'accueil
export function buildHomepagePath(slug = ""): string {
	const homepagePath = projects[ProjectsEnum.Homepage].path;
	return slug ? `${homepagePath}/${slug}` : homepagePath;
}
