import express from "express";

import { globalRouter } from "./globalRouter.ts";
import { healthRouter } from "./health/router.ts";
import { globalErrorHandler } from "./middleware/globalErrorHandler.ts";
import { notFound } from "./middleware/notFound.ts";
import { unhandledMethod } from "./middleware/unhandledMethod.ts";

export const app = express();
app.disable("etag");

app.use(unhandledMethod);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(healthRouter);
app.use(globalRouter);
app.use(notFound);
app.use(globalErrorHandler);
