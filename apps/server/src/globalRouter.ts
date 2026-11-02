import { Router } from "express";

import { backlogRouter } from "./projects/backlog/router.ts";
import { contactRouter } from "./projects/contact/router.ts";
import { gameDeathCounterRouter } from "./projects/gameDeathCounter/router.ts";
import { mailRouter } from "./projects/mail/router.ts";

const globalRouter = Router();

globalRouter.use(gameDeathCounterRouter);
globalRouter.use(backlogRouter);
globalRouter.use(mailRouter);
globalRouter.use(contactRouter);

export { globalRouter };
