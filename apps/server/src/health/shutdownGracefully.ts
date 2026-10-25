import type { Server } from "node:http";

import { sequelize } from "../configuration/sequelize.ts";

// Docker laisse 10 s après SIGTERM avant de tuer le processus : on abandonne juste avant
const SHUTDOWN_TIMEOUT_MS = 9000;

// Arrêt propre, sur SIGTERM (docker stop, redéploiement) ou SIGINT (Ctrl+C) :
// plus de nouvelle connexion, les requêtes en cours se terminent, puis la base est fermée
export function shutdownGracefully(
	server: Server,
	signal: NodeJS.Signals,
): void {
	/* eslint-disable-next-line no-console */
	console.log(`${signal} reçu : arrêt du serveur après les requêtes en cours`);

	setTimeout(() => {
		console.error("Requêtes toujours en cours : arrêt forcé");
		process.exit(1);
	}, SHUTDOWN_TIMEOUT_MS).unref();

	server.close(() => {
		sequelize
			.close()
			.then(() => process.exit(0))
			.catch((error: unknown) => {
				console.error("Échec de la fermeture de la base :", error);
				process.exit(1);
			});
	});
}
