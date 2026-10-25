import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "./apiRequest";

// Relit une route de l'API à intervalle régulier, seulement quand l'onglet est visible :
// onglet caché ou fermé, la console ne demande rien au NAS (§14.1, CPU nul au repos).
// En cas d'erreur, les dernières données restent affichées avec le message.
// updatedAt : l'heure de la dernière lecture réussie, pour les durées (« depuis 3 h »)
export function usePolling<T>(
	path: string,
	intervalMs: number,
): {
	data: T | null;
	updatedAt: number;
	error: string | null;
	refresh: () => void;
} {
	const [data, setData] = useState<T | null>(null);
	const [updatedAt, setUpdatedAt] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [refreshCount, setRefreshCount] = useState(0);

	useEffect(() => {
		let cancelled = false;
		let timer: number | undefined;

		async function load(): Promise<void> {
			window.clearTimeout(timer);
			if (document.hidden) return;
			try {
				const next = await apiRequest<T>(path);
				if (cancelled) return;
				setData(next);
				setUpdatedAt(Date.now());
				setError(null);
			} catch (loadError) {
				if (cancelled) return;
				setError(
					loadError instanceof Error ? loadError.message : String(loadError),
				);
			}
			if (!cancelled)
				timer = window.setTimeout(() => {
					void load();
				}, intervalMs);
		}

		function onVisibilityChange(): void {
			if (!document.hidden) void load();
		}

		void load();
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, [path, intervalMs, refreshCount]);

	const refresh = useCallback(() => {
		setRefreshCount((count) => count + 1);
	}, []);

	return { data, updatedAt, error, refresh };
}
