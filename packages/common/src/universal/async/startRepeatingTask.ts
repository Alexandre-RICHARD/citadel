type Options = {
	intervalMs: number;
	task: () => Promise<void>;
	// Un échec n'arrête pas la répétition : le passage suivant réessaie
	onError: (error: unknown) => Promise<void> | void;
};

/**
 * Lance la tâche tout de suite, puis toutes les `intervalMs`. Un passage ne démarre jamais tant que le précédent tourne
 * (une base lente ne les empile pas). La minuterie ne retient pas le processus à son arrêt. Renvoie de quoi l'arrêter
 */
export function startRepeatingTask({
	intervalMs,
	task,
	onError,
}: Options): () => void {
	let isRunning = false;

	async function runOnce(): Promise<void> {
		if (isRunning) return;
		isRunning = true;
		try {
			await task();
		} catch (error) {
			await onError(error);
		} finally {
			isRunning = false;
		}
	}

	void runOnce();
	const timer = setInterval(() => {
		void runOnce();
	}, intervalMs);
	// Absent du navigateur : seul Node renvoie un objet avec unref
	if (typeof timer === "object" && "unref" in timer) timer.unref();

	return () => {
		clearInterval(timer);
	};
}
