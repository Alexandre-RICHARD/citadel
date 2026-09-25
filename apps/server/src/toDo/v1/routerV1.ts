import { Router as createRouter } from "express";

import { tchatRouter } from "./routers/tchat.router.ts";
import { usersRouter } from "./routers/users.router.ts";

export const routerV1 = createRouter();

routerV1.use("/tchat", tchatRouter);
routerV1.use("/users", usersRouter);
