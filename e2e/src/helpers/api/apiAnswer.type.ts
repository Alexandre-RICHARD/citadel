export type ApiAnswer = {
	status: number;
	// Le corps JSON de la réponse, null s'il n'y en a pas
	data: unknown;
	headers: Record<string, string>;
};
