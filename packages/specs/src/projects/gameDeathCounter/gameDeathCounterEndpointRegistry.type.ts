import type { CreateBoss } from "./endpoint/bosses/createBoss/createBossEndpoint.interface.ts";
import type { DeleteBoss } from "./endpoint/bosses/deleteBoss/deleteBossEndpoint.interface.ts";
import type { GetOneBoss } from "./endpoint/bosses/getOneBoss/getOneBossEndpoint.interface.ts";
import type { SetBossDefeated } from "./endpoint/bosses/setBossDefeated/setBossDefeatedEndpoint.interface.ts";
import type { UpdateBoss } from "./endpoint/bosses/updateBoss/updateBossEndpoint.interface.ts";
import type { AddDeath } from "./endpoint/deaths/addDeath/addDeathEndpoint.interface.ts";
import type { DeleteDeath } from "./endpoint/deaths/deleteDeath/deleteDeathEndpoint.interface.ts";
import type { UpdateDeath } from "./endpoint/deaths/updateDeath/updateDeathEndpoint.interface.ts";
import type { CreateGame } from "./endpoint/games/createGame/createGameEndpoint.interface.ts";
import type { DeleteGame } from "./endpoint/games/deleteGame/deleteGameEndpoint.interface.ts";
import type { GetAllGames } from "./endpoint/games/getAllGames/getAllGamesEndpoint.interface.ts";
import type { GetOneGame } from "./endpoint/games/getOneGame/getOneGameEndpoint.interface.ts";
import type { SetGameFinished } from "./endpoint/games/setGameFinished/setGameFinishedEndpoint.interface.ts";
import type { UpdateGame } from "./endpoint/games/updateGame/updateGameEndpoint.interface.ts";

export type GameDeathCounterEndpointRegistry =
	| AddDeath
	| CreateBoss
	| CreateGame
	| DeleteBoss
	| DeleteDeath
	| DeleteGame
	| GetAllGames
	| GetOneGame
	| GetOneBoss
	| SetBossDefeated
	| SetGameFinished
	| UpdateBoss
	| UpdateDeath
	| UpdateGame;
