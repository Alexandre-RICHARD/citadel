import { connect } from "node:tls";

import type { DeadlineItem } from "../../shared/deadlineItem.type.ts";
import { env } from "../configuration/env.ts";

const TIMEOUT_MS = 4000;

// Le certificat que Caddy présente vraiment pour ce nom : une connexion HTTPS à
// infra-caddy (réseau edge), sans rien télécharger. La console ne voit jamais le dossier
// des certificats de Caddy, ni leurs clés privées.
// rejectUnauthorized: false : on lit les dates même d'un certificat expiré, ou de test
// (pnpm prod:local) ; on ne lui envoie rien.
export function readCertificateExpiry(domain: string): Promise<DeadlineItem> {
	const label = `Certificat ${domain}`;
	return new Promise((resolve) => {
		const socket = connect({
			host: env.CADDY_CONTAINER,
			port: 443,
			servername: domain,
			rejectUnauthorized: false,
			timeout: TIMEOUT_MS,
		});

		function finish(item: DeadlineItem): void {
			socket.destroy();
			resolve(item);
		}

		socket.once("secureConnect", () => {
			const validTo = socket.getPeerCertificate().valid_to;
			const expiresAt = validTo ? new Date(validTo) : null;
			finish(
				expiresAt && !Number.isNaN(expiresAt.getTime())
					? { label, expiresAt: expiresAt.toISOString(), problem: null }
					: { label, expiresAt: null, problem: "date illisible" },
			);
		});
		socket.once("timeout", () => {
			finish({ label, expiresAt: null, problem: "Caddy ne répond pas" });
		});
		// Caddy refuse la connexion s'il n'a aucun certificat pour ce nom
		socket.once("error", () => {
			finish({ label, expiresAt: null, problem: "aucun certificat servi" });
		});
	});
}
