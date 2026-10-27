import type { ProjectDictionary } from "../../../react/appNavigation/projectDictionary.type";
import type { ProjectShowcase } from "../../../react/appNavigation/showcase/projectShowcase.type";

// Un projet de la roue : sa présentation est forcément là
export type ShowcaseProject = ProjectDictionary & { showcase: ProjectShowcase };
