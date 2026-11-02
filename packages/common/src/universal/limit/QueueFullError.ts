// La file d'attente d'un createConcurrencyLimiter est pleine : la tâche n'a pas été lancée, l'appelant peut réessayer
export class QueueFullError extends Error {
	constructor() {
		super("The queue of waiting tasks is full");
		this.name = "QueueFullError";
	}
}
