import type { CreateBoss } from "./endpoint/bosses/createBoss.endpoint.ts";
import type { DeleteBoss } from "./endpoint/bosses/deleteBoss.endpoint.ts";
import type { GetOneBoss } from "./endpoint/bosses/getOneBoss.endpoint.ts";
import type { SetBossDefeated } from "./endpoint/bosses/setBossDefeated.endpoint.ts";
import type { UpdateBoss } from "./endpoint/bosses/updateBoss.endpoint.ts";
import type { AddDeath } from "./endpoint/deaths/addDeath.endpoint.ts";
import type { DeleteDeath } from "./endpoint/deaths/deleteDeath.endpoint.ts";
import type { UpdateDeath } from "./endpoint/deaths/updateDeath.endpoint.ts";
import type { CreateGame } from "./endpoint/games/createGame.endpoint.ts";
import type { DeleteGame } from "./endpoint/games/deleteGame.endpoint.ts";
import type { GetAllGames } from "./endpoint/games/getAllGames.endpoint.ts";
import type { GetOneGame } from "./endpoint/games/getOneGame.endpoint.ts";
import type { SetGameFinished } from "./endpoint/games/setGameFinished.endpoint.ts";
import type { UpdateGame } from "./endpoint/games/updateGame.endpoint.ts";

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
