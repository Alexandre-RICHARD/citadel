import "dotenv/config.js";
import "./configuration/timezone.ts";

import { app } from "./app.ts";
import { env } from "./configuration/env.ts";
import { sequelize } from "./configuration/sequelize.ts";

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
