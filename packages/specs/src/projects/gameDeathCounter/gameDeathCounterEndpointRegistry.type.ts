import type { CreateBoss } from "./endpoint/bosses/createBoss/createBoss.endpoint.ts";
import type { DeleteBoss } from "./endpoint/bosses/deleteBoss/deleteBoss.endpoint.ts";
import type { GetOneBoss } from "./endpoint/bosses/getOneBoss/getOneBoss.endpoint.ts";
import type { SetBossDefeated } from "./endpoint/bosses/setBossDefeated/setBossDefeated.endpoint.ts";
import type { UpdateBoss } from "./endpoint/bosses/updateBoss/updateBoss.endpoint.ts";
import type { AddDeath } from "./endpoint/deaths/addDeath/addDeath.endpoint.ts";
import type { DeleteDeath } from "./endpoint/deaths/deleteDeath/deleteDeath.endpoint.ts";
import type { UpdateDeath } from "./endpoint/deaths/updateDeath/updateDeath.endpoint.ts";
import type { CreateGame } from "./endpoint/games/createGame/createGame.endpoint.ts";
import type { DeleteGame } from "./endpoint/games/deleteGame/deleteGame.endpoint.ts";
import type { GetAllGames } from "./endpoint/games/getAllGames/getAllGames.endpoint.ts";
import type { GetOneGame } from "./endpoint/games/getOneGame/getOneGame.endpoint.ts";
import type { SetGameFinished } from "./endpoint/games/setGameFinished/setGameFinished.endpoint.ts";
import type { UpdateGame } from "./endpoint/games/updateGame/updateGame.endpoint.ts";

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
