import "./configuration/timezone.ts";

import { app } from "./app.ts";
import { env } from "./configuration/env.ts";
import { sequelize } from "./configuration/sequelize.ts";
import { shutdownGracefully } from "./health/shutdownGracefully.ts";

async function start() {
	await sequelize.authenticate();

	const server = app.listen(env.SERVER_PORT, () => {
		/* eslint-disable-next-line no-console */
		console.log(
			`API démarrée sur \x1b[36m\x1b[1mhttp://localhost:${env.SERVER_PORT}/\x1b[0m`,
		);
	});

	for (const signal of ["SIGTERM", "SIGINT"] as const)
		process.once(signal, () => {
			shutdownGracefully(server, signal);
		});
}

start().catch((error: unknown) => {
	console.error("Échec du démarrage du serveur :", error);
	process.exit(1);
});
