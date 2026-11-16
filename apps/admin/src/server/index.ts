import { app } from "./app.ts";
import { env } from "./configuration/env.ts";
import { wakeApp } from "./wake/wakeApp.ts";

// Docker laisse 10 s après SIGTERM : on abandonne juste avant
const SHUTDOWN_TIMEOUT_MS = 9000;

const server = app.listen(env.ADMIN_PORT, () => {
	process.stdout.write(
		`Console ${env.APP_VERSION} démarrée sur le port ${env.ADMIN_PORT}\n`,
	);
});

// Le port de réveil, à part : la console elle-même (8100) ne démarre rien sans session
const wakeServer =
	env.WAKE_PORT === undefined ? null : wakeApp.listen(env.WAKE_PORT);

// Arrêt propre (docker stop, redéploiement) : plus de nouvelle connexion, les requêtes
// en cours se terminent
for (const signal of ["SIGTERM", "SIGINT"] as const)
	process.once(signal, () => {
		setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
		wakeServer?.close();
		server.close(() => process.exit(0));
		// Une action longue (attente de Gluetun) ne doit pas retenir l'arrêt
		server.closeIdleConnections();
	});
