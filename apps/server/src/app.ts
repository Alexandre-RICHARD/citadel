import cors from "cors";
import express from "express";

import { allowedHttpMethods } from "./common/http/allowedHttpMethods.ts";
import { env } from "./configuration/env.ts";
import { globalRouter } from "./globalRouter.ts";
import { globalErrorHandler } from "./middleware/globalErrorHandler.ts";
import { notFound } from "./middleware/notFound.ts";
import { unhandledMethod } from "./middleware/unhandledMethod.ts";

const corsOptions = {
	origin: env.CORS_ORIGIN,
	methods: allowedHttpMethods,
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

export const app = express();
app.disable("etag");

// cors avant unhandledMethod : il répond lui-même aux requêtes ayant la méthode OPTIONS de preflight du navigateur, OPTIONS n'étant pas autorisé sinon
app.use(cors(corsOptions));
app.use(unhandledMethod);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(globalRouter);
app.use(notFound);
app.use(globalErrorHandler);
