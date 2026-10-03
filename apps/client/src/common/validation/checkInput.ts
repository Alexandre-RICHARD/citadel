import { fromZodIssueToValidationIssueDto } from "@citadel/specs/src/specUtils/error/fromZodIssueToValidationIssueDto";
import type { z } from "zod";

import { getValidationIssuePhrase } from "../api/error/getValidationIssuePhrase";
import type { InputCheck } from "./inputCheck.type";

type FieldLabels = Readonly<Partial<Record<string, string>>>;

/**
 * Valide une saisie avec le schéma de l'endpoint, le même que le serveur : un bouton Enregistrer désactivé
 * vaut mieux qu'un 400. Le message reprend les phrases des erreurs 400, sous forme de phrase autonome
 */
export function checkInput<Schema extends z.ZodType>(
	schema: Schema,
	input: z.input<Schema>,
	fieldLabels: FieldLabels,
): InputCheck<z.output<Schema>> {
	const result = schema.safeParse(input);
	if (result.success) return { isValid: true, data: result.data };

	const [firstIssue] = result.error.issues;
	if (firstIssue === undefined)
		return { isValid: false, message: "La saisie n'est pas valide." };

	const issue = fromZodIssueToValidationIssueDto(firstIssue);
	const fieldName = issue.path[0];
	const fieldLabel =
		fieldName === undefined ? undefined : fieldLabels[String(fieldName)];
	const sentence = `${fieldLabel === undefined ? "" : `${fieldLabel} `}${getValidationIssuePhrase(issue)}`;

	return {
		isValid: false,
		message: `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`,
	};
}
