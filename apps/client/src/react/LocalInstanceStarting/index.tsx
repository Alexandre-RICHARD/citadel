import { CacheOverlay } from "@citadel/design-system/src/atoms/CacheOverlay";
import { useEffect, useSyncExternalStore } from "react";

import styles from "./localInstanceStarting.module.scss";
import { localInstanceStartingStore } from "./localInstanceStartingStore";

/**
 * « Démarrage… » par-dessus la page, puis rechargement : l'instance locale du backlog des médias s'était arrêtée faute
 * de visite, et la console du NAS vient de la démarrer. Rien ne s'affiche ailleurs que sur l'adresse locale
 */
export function LocalInstanceStarting() {
	const reloadDelaySeconds = useSyncExternalStore(
		localInstanceStartingStore.subscribe,
		localInstanceStartingStore.getReloadDelaySeconds,
	);

	useEffect(() => {
		if (reloadDelaySeconds === null) return undefined;
		const timer = window.setTimeout(() => {
			window.location.reload();
		}, reloadDelaySeconds * 1000);
		return () => {
			window.clearTimeout(timer);
		};
	}, [reloadDelaySeconds]);

	if (reloadDelaySeconds === null) return null;
	return (
		<CacheOverlay>
			<div
				className={styles.card}
				role="status"
			>
				<p className={styles.title}>Démarrage…</p>
				<p>
					Le serveur local se réveille, la page se recharge dans un instant.
				</p>
			</div>
		</CacheOverlay>
	);
}
