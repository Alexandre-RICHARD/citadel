import { ShieldCheck } from "lucide-react";

import type { VpnStatus } from "../../../shared/vpnStatus.type";
import { usePolling } from "../../api/usePolling";
import { Card } from "../Card";
import { Stat } from "../Stat";
import styles from "./vpnCard.module.scss";

// L'IP de sortie change rarement : relue toutes les 30 s
export function VpnCard() {
	const { data, error } = usePolling<VpnStatus>("/vpn", 30_000);

	if (!data)
		return (
			<Card
				title="VPN"
				icon={ShieldCheck}
				error={error}
			>
				<p className={styles.muted}>Lecture…</p>
			</Card>
		);

	if (!data.available)
		return (
			<Card
				title="VPN"
				icon={ShieldCheck}
				status={{ tone: "danger", text: "Injoignable" }}
				error={error}
			>
				<p className={styles.muted}>{data.reason}</p>
			</Card>
		);

	const place = [data.city, data.country].filter(Boolean).join(", ");
	return (
		<Card
			title="VPN"
			icon={ShieldCheck}
			status={{ tone: "ok", text: "Connecté" }}
			error={error}
		>
			<p className={styles.ip}>{data.publicIp ?? "IP inconnue"}</p>
			<Stat label="Sortie">{place || "–"}</Stat>
			<Stat
				label="Port redirigé"
				mono
			>
				{data.forwardedPort ?? "aucun"}
			</Stat>
		</Card>
	);
}
