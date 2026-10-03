export type ErrorResponseDto<Code extends string> = {
	code: Code;
	message: string;
};
