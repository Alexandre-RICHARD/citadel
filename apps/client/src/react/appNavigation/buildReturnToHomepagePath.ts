import { ProjectsEnum } from "./projects.enum";
import { projects } from "./projectsDictionary";

// Le retour d'un projet vers la homepage rouvre sa présentation : /homepage/backlog
export function buildReturnToHomepagePath(project: ProjectsEnum): string {
	return `${projects[ProjectsEnum.Homepage].path}${projects[project].path}`;
}
