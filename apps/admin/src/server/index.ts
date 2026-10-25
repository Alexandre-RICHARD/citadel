import { app } from "./app.ts";
import { env } from "./configuration/env.ts";

// Docker laisse 10 s après SIGTERM : on abandonne juste avant
const SHUTDOWN_TIMEOUT_MS = 9000;

const server = app.listen(env.ADMIN_PORT, () => {
	process.stdout.write(
		`Console ${env.APP_VERSION} démarrée sur le port ${env.ADMIN_PORT}\n`,
	);
});

// Arrêt propre (docker stop, redéploiement) : plus de nouvelle connexion, les requêtes
// en cours se terminent
for (const signal of ["SIGTERM", "SIGINT"] as const)
	process.once(signal, () => {
		setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
		server.close(() => process.exit(0));
		// Une action longue (attente de Gluetun) ne doit pas retenir l'arrêt
		server.closeIdleConnections();
	});
