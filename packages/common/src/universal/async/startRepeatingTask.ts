type Options = {
	intervalMs: number;
	task: () => Promise<void>;
	// Un échec n'arrête pas la répétition : le passage suivant réessaie. Un onError qui échoue lui-même est ignoré
	onError: (error: unknown) => Promise<void> | void;
};

/**
 * Lance la tâche tout de suite, puis toutes les `intervalMs`. Un passage ne démarre jamais tant que le précédent tourne
 * (une base lente ne les empile pas). La minuterie ne retient pas le processus à son arrêt. Renvoie de quoi l'arrêter :
 * plus aucun passage ne démarre, et la promesse se résout quand celui en cours a fini (la base peut alors fermer)
 */
export function startRepeatingTask({
	intervalMs,
	task,
	onError,
}: Options): () => Promise<void> {
	let currentRun: Promise<void> | null = null;

	async function reportError(error: unknown): Promise<void> {
		try {
			await onError(error);
		} catch {
			// Rien de plus à faire : une promesse rejetée sans preneur arrêterait tout le processus
		}
	}

	async function runOnce(): Promise<void> {
		try {
			await task();
		} catch (error) {
			await reportError(error);
		} finally {
			currentRun = null;
		}
	}

	function startRun(): void {
		currentRun ??= runOnce();
	}

	startRun();
	const timer = setInterval(startRun, intervalMs);
	// Absent du navigateur : seul Node renvoie un objet avec unref
	if (typeof timer === "object" && "unref" in timer) timer.unref();

	return async () => {
		clearInterval(timer);
		await currentRun;
	};
}
