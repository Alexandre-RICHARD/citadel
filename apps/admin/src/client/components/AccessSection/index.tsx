import type { SiteTraffic } from "../../../shared/siteTraffic.type";
import { usePolling } from "../../api/usePolling";
import { JellyfinCard } from "../JellyfinCard";
import { RequestsTable } from "../RequestsTable";
import { ScansCard } from "../ScansCard";
import { TailscaleCard } from "../TailscaleCard";
import { TrafficCard } from "../TrafficCard";
import styles from "./accessSection.module.scss";

// Fonctionnalité 6 (§14.3) : qui vient sur le NAS. Le site par les logs de Caddy (relus
// chaque minute, une seule lecture pour les cartes et le tableau), Jellyfin et
// Tailscale chacun à son rythme.
export function AccessSection() {
	const traffic = usePolling<SiteTraffic>("/traffic", 60_000);

	return (
		<section
			className={styles.accessSection}
			aria-labelledby="access-title"
		>
			<h2
				id="access-title"
				className={styles.title}
			>
				Accès externes
			</h2>
			<div className={styles.cards}>
				<TrafficCard
					traffic={traffic.data}
					error={traffic.error}
				/>
				<ScansCard
					traffic={traffic.data}
					now={traffic.updatedAt}
				/>
				<JellyfinCard />
				<TailscaleCard />
			</div>
			{traffic.data?.available ? (
				<>
					<h3 className={styles.subtitle}>Dernières requêtes sur le site</h3>
					<RequestsTable
						requests={traffic.data.recentRequests}
						now={traffic.updatedAt}
					/>
				</>
			) : null}
		</section>
	);
}
