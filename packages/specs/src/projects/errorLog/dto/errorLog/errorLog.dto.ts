export type ErrorLogDto = {
	id: number;
	errorType: string;
	message: string;
	stack: string | null;
	createdAt: string;
};
