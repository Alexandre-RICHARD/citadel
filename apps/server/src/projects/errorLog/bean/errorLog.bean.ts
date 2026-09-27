export type ErrorLogBean = {
	id: number;
	errorType: string;
	message: string;
	stack: string | null;
	createdAt: Date;
};
