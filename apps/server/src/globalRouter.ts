import { Router } from "express";

import { nasSettings } from "./configuration/nasSettings.ts";
import { authRouter } from "./projects/auth/router.ts";
import { nasRouter } from "./projects/backlog/nasRouter.ts";
import { backlogRouter } from "./projects/backlog/router.ts";
import { contactRouter } from "./projects/contact/router.ts";
import { gameDeathCounterRouter } from "./projects/gameDeathCounter/router.ts";
import { mailRouter } from "./projects/mail/router.ts";

const globalRouter = Router();

globalRouter.use(gameDeathCounterRouter);
globalRouter.use(backlogRouter);
// Le mode connecté du backlog des médias : sur l'instance locale du NAS seulement (MEDIA_STATE_DIR posée)
if (nasSettings !== null) globalRouter.use(nasRouter);
globalRouter.use(mailRouter);
globalRouter.use(contactRouter);
globalRouter.use(authRouter);

export { globalRouter };
