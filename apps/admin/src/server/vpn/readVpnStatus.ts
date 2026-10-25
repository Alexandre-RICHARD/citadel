import type { VpnStatus } from "../../shared/vpnStatus.type.ts";
import { env } from "../configuration/env.ts";
import { fetchWithTimeout } from "../http/fetchWithTimeout.ts";

// Le serveur de contrôle de Gluetun (port 8000, jamais publié) : l'IP de sortie du VPN et
// le port ouvert par ProtonVPN. Depuis la v3.40, chaque route exige une clé : celle de
// GLUETUN_API_KEY, donnée à Gluetun par compose.yml (HTTP_CONTROL_SERVER_AUTH_DEFAULT_ROLE).
type PublicIpResponse = {
	public_ip?: string;
	country?: string;
	city?: string;
};

async function getJson<T>(path: string): Promise<T> {
	const response = await fetchWithTimeout(`${env.GLUETUN_URL}${path}`, {
		headers: { "X-API-Key": env.GLUETUN_API_KEY },
	});
	if (response.status === 401 || response.status === 403)
		throw new Error("clé d'API refusée (GLUETUN_API_KEY)");
	if (!response.ok) throw new Error(`réponse ${response.status}`);
	return (await response.json()) as T;
}

export async function readVpnStatus(): Promise<VpnStatus> {
	try {
		const [publicIp, portForward] = await Promise.all([
			getJson<PublicIpResponse>("/v1/publicip/ip"),
			getJson<{ port?: number }>("/v1/portforward"),
		]);
		return {
			available: true,
			publicIp: publicIp.public_ip ?? null,
			country: publicIp.country ?? null,
			city: publicIp.city ?? null,
			// 0 : aucun port ouvert pour l'instant
			forwardedPort: portForward.port === 0 ? null : (portForward.port ?? null),
		};
	} catch (error) {
		return {
			available: false,
			reason:
				error instanceof Error && error.message.startsWith("clé")
					? `Gluetun : ${error.message}`
					: "Gluetun injoignable",
		};
	}
}
