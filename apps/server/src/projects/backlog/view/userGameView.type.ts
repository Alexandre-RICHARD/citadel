import type { UserGameBean } from "../bean/userGameBean.type.ts";
import type { ViewRow } from "./viewRow.type.ts";

// Un jeu du backlog, sa ligne, et chacune de ses versions jouées vue comme une ligne (pour les filtres)
export type UserGameView = {
	userGame: UserGameBean;
	row: ViewRow;
	userVersionRows: ViewRow[];
};
