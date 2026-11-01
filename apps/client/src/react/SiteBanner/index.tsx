import { useLocalStorage } from "@citadel/common/src/react/hooks/useLocalStorage";
import { useNow } from "@citadel/common/src/react/hooks/useNow";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { isBannerVisible } from "./isBannerVisible";
import { parseSiteBanner } from "./parseSiteBanner";
import styles from "./siteBanner.module.scss";
import type { SiteBanner as SiteBannerType } from "./siteBanner.type";

const DISMISSED_KEY = "citadel:banner:dismissed";
// Un bandeau échu disparaît dans la minute, même la page restée ouverte
const NOW_REFRESH_MS = 60_000;

function readDismissed(stored: unknown): string | null {
	return typeof stored === "string" ? stored : null;
}

// Le bandeau du site, sur tous les projets :
// un message écrit depuis la console, ou l'avis automatique après une restauration.
// Lu une fois au chargement, dans /banner.json que Caddy sert sans passer par l'API :
// il s'affiche même si l'API est en panne. Seule sa croix le ferme.
export function SiteBanner() {
	const [banner, setBanner] = useState<SiteBannerType | null>(null);
	const now = useNow(NOW_REFRESH_MS);
	const [dismissedId, setDismissedId] = useLocalStorage<string | null>(
		DISMISSED_KEY,
		readDismissed,
	);

	useEffect(() => {
		const controller = new AbortController();
		fetch("/banner.json", { signal: controller.signal, cache: "no-store" })
			.then((response) => (response.ok ? response.json() : null))
			.then((value: unknown) => setBanner(parseSiteBanner(value)))
			// Pas de bandeau (404), ou réseau coupé : rien à afficher
			.catch(() => setBanner(null));
		return () => controller.abort();
	}, []);

	if (!isBannerVisible(banner, dismissedId, now)) return null;

	return (
		<div
			className={styles.siteBanner}
			role="status"
		>
			<span
				className={styles.emoji}
				aria-hidden
			>
				{banner.kind === "restore" ? "⚠️" : "🚧"}
			</span>
			<p className={styles.message}>{banner.message}</p>
			<button
				type="button"
				className={styles.close}
				aria-label="Fermer le bandeau"
				onClick={() => setDismissedId(banner.id)}
			>
				<X size={16} />
			</button>
		</div>
	);
}
