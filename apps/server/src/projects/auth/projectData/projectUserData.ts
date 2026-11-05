import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";

import type { ProjectUserData } from "../../../common/userData/projectUserData.type.ts";
import { backlogUserData } from "../../backlog/userData/backlogUserData.ts";
import { gameDeathCounterUserData } from "../../gameDeathCounter/userData/gameDeathCounterUserData.ts";

// Les projets qui gardent des données d'un compte. Un nouveau projet à comptes s'ajoute ici : export, suppression du
// compte et suppression de ses données suivent seuls
export const projectUserData: Record<UserDataProjectEnum, ProjectUserData> = {
	[UserDataProjectEnum.GAME_DEATH_COUNTER]: gameDeathCounterUserData,
	[UserDataProjectEnum.BACKLOG]: backlogUserData,
};
