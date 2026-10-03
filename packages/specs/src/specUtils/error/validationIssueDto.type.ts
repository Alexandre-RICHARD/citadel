import type { ValidationIssueCodeEnum } from "./validationIssueCode.enum.ts";

// Un champ refusé : `code` et `limit` suffisent au front pour afficher l'erreur, `message` reste pour le développeur
export type ValidationIssueDto = {
	path: (string | number)[];
	code: ValidationIssueCodeEnum;
	// Borne de la règle : en caractères pour TOO_SHORT et TOO_LONG, en valeur pour TOO_SMALL et TOO_BIG
	limit?: number;
	message: string;
};
