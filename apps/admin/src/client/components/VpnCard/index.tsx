import { ShieldCheck, ShieldQuestion } from "lucide-react";

import type { JobItem } from "../../../shared/jobItem.type";
import type { VpnStatus } from "../../../shared/vpnStatus.type";
import { usePolling } from "../../api/usePolling";
import { formatAgo } from "../../format/formatAgo";
import { leakTestStatus } from "../../status/leakTestStatus";
import { ActionButton } from "../ActionButton";
import { Card } from "../Card";
import { Stat } from "../Stat";
import { StatusDot } from "../StatusDot";
import styles from "./vpnCard.module.scss";

type Props = {
	// Une demande est déjà suivie : le bouton attend
	busy: boolean;
	onLeakTest: () => void;
};

const LEAK_TEST_JOB = "vpn-leak-test";

// Le test de fuite (job vpn-leak-test, chaque nuit) : IP de sortie, DNS, qBittorrent dans
// le réseau de Gluetun. Son dernier résultat, et un bouton pour le relancer.
function LeakTest({ busy, onLeakTest }: Props) {
	const jobs = usePolling<JobItem[]>("/jobs", 30_000);
	const job = jobs.data?.find((item) => item.name === LEAK_TEST_JOB);
	const status = leakTestStatus(job);
	const date = job?.finishedAt ?? job?.startedAt ?? null;

	return (
		<div className={styles.leakTest}>
			<p className={styles.leakResult}>
				<StatusDot
					tone={status.tone}
					label={status.text}
				/>
				<span>{`Fuites : ${status.text}`}</span>
			</p>
			<div className={styles.leakFooter}>
				<span className={styles.muted}>
					{date ? formatAgo(date, jobs.updatedAt) : ""}
				</span>
				<ActionButton
					label="Tester"
					icon={ShieldQuestion}
					disabled={busy || job?.status === "running"}
					onClick={onLeakTest}
				/>
			</div>
		</div>
	);
}

// L'IP de sortie change rarement : relue toutes les 30 s
export function VpnCard({ busy, onLeakTest }: Props) {
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
				<LeakTest
					busy={busy}
					onLeakTest={onLeakTest}
				/>
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
			<LeakTest
				busy={busy}
				onLeakTest={onLeakTest}
			/>
		</Card>
	);
}
