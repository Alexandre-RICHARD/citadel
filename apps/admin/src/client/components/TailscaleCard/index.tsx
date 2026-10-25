import { Network } from "lucide-react";

import type { TailscaleStatus } from "../../../shared/tailscaleStatus.type";
import { usePolling } from "../../api/usePolling";
import { formatAgo } from "../../format/formatAgo";
import { Card } from "../Card";
import { StatusDot } from "../StatusDot";
import styles from "./tailscaleCard.module.scss";

// infra-ops relève chaque minute : au-delà de 3, Tailscale ou infra-ops est arrêté
const STALE_AFTER_MS = 180_000;

// Les appareils de ton tailnet, relevés par infra-ops (citadel tailscale-status)
export function TailscaleCard() {
	const { data, updatedAt, error } = usePolling<TailscaleStatus>(
		"/tailscale",
		60_000,
	);

	if (!data?.available)
		return (
			<Card
				title="Tailscale"
				icon={Network}
				status={data ? { tone: "idle", text: "Indisponible" } : undefined}
				error={error}
			>
				<p className={styles.muted}>{data ? data.reason : "Lecture…"}</p>
			</Card>
		);

	const stale = updatedAt - Date.parse(data.collectedAt) > STALE_AFTER_MS;
	const online = data.devices.filter((device) => device.online).length;
	return (
		<Card
			title="Tailscale"
			icon={Network}
			status={
				stale
					? { tone: "warn", text: "Relevé ancien" }
					: { tone: "ok", text: `${online} en ligne` }
			}
			error={error}
		>
			{stale ? (
				<p className={styles.muted}>
					{`Relevé ${formatAgo(data.collectedAt, updatedAt)} : Tailscale ou infra-ops arrêté ?`}
				</p>
			) : null}
			<ul className={styles.list}>
				{data.devices.map((device) => (
					<li
						key={device.name}
						className={styles.device}
					>
						<StatusDot
							tone={device.online ? "ok" : "idle"}
							label={device.online ? "En ligne" : "Hors ligne"}
						/>
						<span className={styles.name}>{device.name}</span>
						<span className={styles.meta}>
							{device.online
								? `${device.os} · ${device.direct ? "direct" : "relayé"}`
								: device.lastSeen
									? `vu ${formatAgo(device.lastSeen, updatedAt)}`
									: device.os}
						</span>
					</li>
				))}
			</ul>
		</Card>
	);
}
