import type { ProjectDictionary } from "../../../react/appNavigation/projectDictionary.type";

// Un projet sélectionné se lit dans l'adresse : /homepage/game-death-counter
export function getProjectSlug(project: ProjectDictionary): string {
	return project.path.replace(/^\//, "");
}
