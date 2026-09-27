import { createGameBodySchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameBody.schema.ts";
import { deleteGamePathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/deleteGame/deleteGamePathParam.schema.ts";
import { getOneGamePathParamSchema } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/getOneGame/getOneGamePathParam.schema.ts";
import type { GameDeathCounterEndpointRegistry } from "@citadel/specs/src/specs.ts";
import { Router as ExpressRouter } from "express";

import { createTypedExpressRouter } from "../../common/routing/createTypedExpressRouter.ts";
import { requestValidator } from "../../middleware/requestValidator.ts";
import { gameController } from "./controller/game.controller.ts";

const expressRouter = ExpressRouter();

const typedRouter =
	createTypedExpressRouter<GameDeathCounterEndpointRegistry>(expressRouter);

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

typedRouter.DELETE(
	"/gameDeathCounter/games/:id",
	gameController.delete,
	requestValidator({ params: deleteGamePathParamSchema }),
);

export const gameDeathCounterRouter = expressRouter;
