import { ProjectsEnum } from "./projects.enum";

// Chargement du code de chaque projet. Le routeur s'en sert ; la transition vers un projet le lance en avance,
// dès le clic, pendant que l'écran se couvre : la page est prête quand il se découvre
export const projectLoaders = {
	[ProjectsEnum.Homepage]: () => import("../../projects/homepage"),
	[ProjectsEnum.Satisfactory]: () => import("../../projects/satisfactory"),
	[ProjectsEnum.GameDeathCount]: () =>
		import("../../projects/gameDeathCounter"),
	[ProjectsEnum.Backlog]: () => import("../../projects/backlog"),
	[ProjectsEnum.AngersIrigo]: () => import("../../projects/angersIrigo"),
} satisfies Record<ProjectsEnum, () => Promise<unknown>>;
