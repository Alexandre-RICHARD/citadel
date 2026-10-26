import { Router } from "express";

import { backlogRouter } from "./projects/backlog/router.ts";
import { errorLogRouter } from "./projects/errorLog/router.ts";
import { gameDeathCounterRouter } from "./projects/gameDeathCounter/router.ts";
import { testRouter } from "./projects/test/router.ts";

const globalRouter = Router();

globalRouter.use(testRouter);
globalRouter.use(errorLogRouter);
globalRouter.use(gameDeathCounterRouter);
globalRouter.use(backlogRouter);

export { globalRouter };
