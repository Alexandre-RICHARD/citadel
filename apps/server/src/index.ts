import "dotenv/config.js";
import "./timezone.ts";

import cors from "cors";
import express from "express";

import { allowedHttpMethods } from "./common/http/allowedHttpMethods.ts";
import { env } from "./env.ts";
import { globalRouter } from "./globalRouter.ts";
import { globalErrorHandler } from "./middleware/globalErrorHandler.ts";
import { notFound } from "./middleware/notFound.ts";
import { unhandledMethod } from "./middleware/unhandledMethod.ts";
import { sequelize } from "./sequelize.ts";

const corsOptions = {
	origin: env.CORS_ORIGIN,
	methods: allowedHttpMethods,
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

const app = express();
app.disable("etag");

// cors avant unhandledMethod : il répond lui-même aux requêtes ayant la méthode OPTIONS de preflight du navigateur, OPTIONS n'étant pas autorisé sinon
app.use(cors(corsOptions));
app.use(unhandledMethod);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(globalRouter);
app.use(notFound);
app.use(globalErrorHandler);

async function start() {
	await sequelize.authenticate();

	app.listen(env.LOCAL_PORT, () => {
		/* eslint-disable-next-line no-console */
		console.log(
			`API démarrée sur \x1b[36m\x1b[1mhttp://localhost:${env.LOCAL_PORT}/\x1b[0m`,
		);
	});
}

start().catch((error: unknown) => {
	console.error("Échec du démarrage du serveur :", error);
	process.exit(1);
});
