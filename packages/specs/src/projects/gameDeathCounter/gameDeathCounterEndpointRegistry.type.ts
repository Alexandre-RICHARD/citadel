import type { CreateBoss } from "./endpoint/bosses/createBoss/createBossEndpoint.type.ts";
import type { DeleteBoss } from "./endpoint/bosses/deleteBoss/deleteBossEndpoint.type.ts";
import type { GetOneBoss } from "./endpoint/bosses/getOneBoss/getOneBossEndpoint.type.ts";
import type { SetBossDefeated } from "./endpoint/bosses/setBossDefeated/setBossDefeatedEndpoint.type.ts";
import type { UpdateBoss } from "./endpoint/bosses/updateBoss/updateBossEndpoint.type.ts";
import type { AddDeath } from "./endpoint/deaths/addDeath/addDeathEndpoint.type.ts";
import type { DeleteDeath } from "./endpoint/deaths/deleteDeath/deleteDeathEndpoint.type.ts";
import type { UpdateDeath } from "./endpoint/deaths/updateDeath/updateDeathEndpoint.type.ts";
import type { CreateGame } from "./endpoint/games/createGame/createGameEndpoint.type.ts";
import type { DeleteGame } from "./endpoint/games/deleteGame/deleteGameEndpoint.type.ts";
import type { GetAllGames } from "./endpoint/games/getAllGames/getAllGamesEndpoint.type.ts";
import type { GetOneGame } from "./endpoint/games/getOneGame/getOneGameEndpoint.type.ts";
import type { SetGameFinished } from "./endpoint/games/setGameFinished/setGameFinishedEndpoint.type.ts";
import type { UpdateGame } from "./endpoint/games/updateGame/updateGameEndpoint.type.ts";

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
