import type { ErrorResponseDto } from "./errorResponse.dto.ts";

// Corps d'une réponse 400 : `issues` détaille les champs invalides (vide si aucun champ précis n'est en cause)
export type ValidationErrorResponseDto = ErrorResponseDto & {
	issues: {
		path: (string | number)[];
		message: string;
	}[];
};
