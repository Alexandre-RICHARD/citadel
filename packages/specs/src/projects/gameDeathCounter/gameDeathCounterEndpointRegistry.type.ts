import type { CreateBoss } from "./endpoint/bosses/createBoss/createBossEndpoint.ts";
import type { DeleteBoss } from "./endpoint/bosses/deleteBoss/deleteBossEndpoint.ts";
import type { GetOneBoss } from "./endpoint/bosses/getOneBoss/getOneBossEndpoint.ts";
import type { SetBossDefeated } from "./endpoint/bosses/setBossDefeated/setBossDefeatedEndpoint.ts";
import type { UpdateBoss } from "./endpoint/bosses/updateBoss/updateBossEndpoint.ts";
import type { AddDeath } from "./endpoint/deaths/addDeath/addDeathEndpoint.ts";
import type { DeleteDeath } from "./endpoint/deaths/deleteDeath/deleteDeathEndpoint.ts";
import type { UpdateDeath } from "./endpoint/deaths/updateDeath/updateDeathEndpoint.ts";
import type { CreateGame } from "./endpoint/games/createGame/createGameEndpoint.ts";
import type { DeleteGame } from "./endpoint/games/deleteGame/deleteGameEndpoint.ts";
import type { GetAllGames } from "./endpoint/games/getAllGames/getAllGamesEndpoint.ts";
import type { GetOneGame } from "./endpoint/games/getOneGame/getOneGameEndpoint.ts";
import type { SetGameFinished } from "./endpoint/games/setGameFinished/setGameFinishedEndpoint.ts";
import type { UpdateGame } from "./endpoint/games/updateGame/updateGameEndpoint.ts";

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
