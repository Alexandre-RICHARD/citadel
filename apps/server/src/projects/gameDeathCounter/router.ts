import { createBossBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossBody.schema.ts";
import { deleteBossPathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/deleteBoss/deleteBossPathParam.schema.ts";
import { getOneBossPathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/getOneBoss/getOneBossPathParam.schema.ts";
import { setBossDefeatedBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedBody.schema.ts";
import { setBossDefeatedPathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedPathParam.schema.ts";
import { updateBossBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossBody.schema.ts";
import { updateBossPathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossPathParam.schema.ts";
import { addDeathPathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/addDeath/addDeathPathParam.schema.ts";
import { deleteDeathPathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/deleteDeath/deleteDeathPathParam.schema.ts";
import { updateDeathBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathBody.schema.ts";
import { updateDeathPathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathPathParam.schema.ts";
import { createGameBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameBody.schema.ts";
import { deleteGamePathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/deleteGame/deleteGamePathParam.schema.ts";
import { getOneGamePathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getOneGame/getOneGamePathParam.schema.ts";
import { setGameFinishedBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedBody.schema.ts";
import { setGameFinishedPathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedPathParam.schema.ts";
import type { GameDeathCounterEndpointRegistry } from "@citadel/specs/src/projects/gameDeathCounter/gameDeathCounterEndpointRegistry.type.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { requestValidator } from "../../middleware/requestValidator.ts";
import { bossController } from "./controller/boss.controller.ts";
import { deathController } from "./controller/death.controller.ts";
import { gameController } from "./controller/game.controller.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<GameDeathCounterEndpointRegistry>(expressRouter);

// ==== GAMES ====
typedRouter.GET("/gameDeathCounter/games", gameController.getAll);

typedRouter.GET(
	"/gameDeathCounter/games/:id",
	gameController.getOne,
	requestValidator({ params: getOneGamePathParamSchema }),
);

typedRouter.POST(
	"/gameDeathCounter/games",
	gameController.create,
	requestValidator({ body: createGameBodySchema }),
);

typedRouter.PATCH(
	"/gameDeathCounter/games/:id/finished",
	gameController.setFinished,
	requestValidator({
		params: setGameFinishedPathParamSchema,
		body: setGameFinishedBodySchema,
	}),
);

typedRouter.DELETE(
	"/gameDeathCounter/games/:id",
	gameController.delete,
	requestValidator({ params: deleteGamePathParamSchema }),
);

// ==== BOSSES ====
typedRouter.GET(
	"/gameDeathCounter/bosses/:id",
	bossController.getOne,
	requestValidator({ params: getOneBossPathParamSchema }),
);

typedRouter.POST(
	"/gameDeathCounter/bosses",
	bossController.create,
	requestValidator({ body: createBossBodySchema }),
);

typedRouter.PATCH(
	"/gameDeathCounter/bosses/:id",
	bossController.update,
	requestValidator({
		params: updateBossPathParamSchema,
		body: updateBossBodySchema,
	}),
);

typedRouter.PATCH(
	"/gameDeathCounter/bosses/:id/defeated",
	bossController.setDefeated,
	requestValidator({
		params: setBossDefeatedPathParamSchema,
		body: setBossDefeatedBodySchema,
	}),
);

typedRouter.DELETE(
	"/gameDeathCounter/bosses/:id",
	bossController.delete,
	requestValidator({ params: deleteBossPathParamSchema }),
);

// ==== DEATHS ====
typedRouter.POST(
	"/gameDeathCounter/bosses/:id/deaths",
	deathController.add,
	requestValidator({ params: addDeathPathParamSchema }),
);

typedRouter.PATCH(
	"/gameDeathCounter/deaths/:id",
	deathController.update,
	requestValidator({
		params: updateDeathPathParamSchema,
		body: updateDeathBodySchema,
	}),
);

typedRouter.DELETE(
	"/gameDeathCounter/deaths/:id",
	deathController.delete,
	requestValidator({ params: deleteDeathPathParamSchema }),
);

export const gameDeathCounterRouter = expressRouter;
