export type ApiCall = {
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	// Le chemin de l'API (ApiPathEnum), éventuellement suivi d'un identifiant
	path: string;
	body?: unknown;
};
