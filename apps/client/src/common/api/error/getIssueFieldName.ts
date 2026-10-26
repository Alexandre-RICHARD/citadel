import type { ValidationIssueDto } from "@citadel/specs/src/specUtils/error/validationIssueDto.type";

/**
 * Champ visé par une issue : le plus profond qui porte un nom. Dans un corps imbriqué
 * (`["customization", "seriesNumber"]`), c'est le champ précis, pas le bloc ; un index de liste ne nomme rien
 */
export function getIssueFieldName(
	path: ValidationIssueDto["path"],
): string | undefined {
	return path.findLast((key) => typeof key === "string");
}
