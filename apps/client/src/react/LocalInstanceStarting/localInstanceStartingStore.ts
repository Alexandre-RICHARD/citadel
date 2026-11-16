const listeners = new Set<() => void>();
let reloadDelaySeconds: number | null = null;

/**
 * L'instance locale démarre : annoncé par le cache des requêtes (hors de React), affiché par LocalInstanceStarting.
 * null : rien ne démarre. Le premier délai annoncé est gardé : les requêtes suivantes de la même page ne repoussent pas
 * le rechargement
 */
export const localInstanceStartingStore = {
	subscribe: (listener: () => void): (() => void) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},

	getReloadDelaySeconds: (): number | null => reloadDelaySeconds,

	announce: (delaySeconds: number): void => {
		if (reloadDelaySeconds !== null) return;
		reloadDelaySeconds = delaySeconds;
		listeners.forEach((listener) => listener());
	},
};
