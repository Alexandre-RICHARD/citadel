let queue: Promise<unknown> = Promise.resolve();

/**
 * Une écriture des cases « Vérifié » à la fois : chacune relit le fichier, le modifie et le réécrit. Deux en même temps
 * (deux onglets) perdraient sinon l'une des deux. Une seule instance écrit ce fichier : un verrou en mémoire suffit
 */
export async function runSerially<Result>(
	task: () => Promise<Result>,
): Promise<Result> {
	const run = queue.then(task, task);
	queue = run.catch(() => undefined);
	return run;
}
