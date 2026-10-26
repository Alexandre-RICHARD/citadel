import { Router } from "express";

import { backlogRouter } from "./projects/backlog/router.ts";
import { errorLogRouter } from "./projects/errorLog/router.ts";
import { gameDeathCounterRouter } from "./projects/gameDeathCounter/router.ts";

const globalRouter = Router();

globalRouter.use(errorLogRouter);
globalRouter.use(gameDeathCounterRouter);
globalRouter.use(backlogRouter);

export { globalRouter };
