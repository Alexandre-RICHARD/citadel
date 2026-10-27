import type { ProjectsEnum } from "../appNavigation/projects.enum";

// Chaque projet garde son propre choix de thème : citadel:backlog:theme…
export function getColorSchemeStorageKey(project: ProjectsEnum): string {
	return `citadel:${project}:theme`;
}
