// Une réponse en erreur de l'API, avec le message du serveur (déjà en français)
export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}
