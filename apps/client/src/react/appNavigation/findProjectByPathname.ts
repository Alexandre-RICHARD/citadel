import type { ProjectDictionary } from "./projectDictionary.type";
import { projects } from "./projectsDictionary";

// Le projet d'une adresse, d'après son premier segment : /homepage/backlog est encore la homepage
export function findProjectByPathname(
	pathname: string,
): ProjectDictionary | undefined {
	const firstSegment = pathname.split("/")[1] ?? "";
	return Object.values(projects).find(
		(project) => project.path === `/${firstSegment}`,
	);
}
