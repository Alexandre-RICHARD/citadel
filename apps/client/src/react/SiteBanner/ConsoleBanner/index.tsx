import { useLocalStorage } from "@citadel/common/src/react/hooks/useLocalStorage";
import { useNow } from "@citadel/common/src/react/hooks/useNow";
import { useEffect, useState } from "react";

import { BannerItem } from "../BannerItem";
import { isBannerVisible } from "../isBannerVisible";
import { parseSiteBanner } from "../parseSiteBanner";
import { readDismissedId } from "../readDismissedId";
import type { SiteBanner } from "../siteBanner.type";

const DISMISSED_KEY = "citadel:banner:dismissed";
// Un bandeau échu disparaît dans la minute, même la page restée ouverte
const NOW_REFRESH_MS = 60_000;

// Un message écrit depuis la console, ou l'avis automatique après une restauration.
// Lu une fois au chargement, dans /banner.json que Caddy sert sans passer par l'API :
// il s'affiche même si l'API est en panne
export function ConsoleBanner() {
	const [banner, setBanner] = useState<SiteBanner | null>(null);
	const now = useNow(NOW_REFRESH_MS);
	const [dismissedId, setDismissedId] = useLocalStorage<string | null>(
		DISMISSED_KEY,
		readDismissedId,
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
		<BannerItem
			emoji={banner.kind === "restore" ? "⚠️" : "🚧"}
			message={banner.message}
			onClose={() => setDismissedId(banner.id)}
		/>
	);
}
