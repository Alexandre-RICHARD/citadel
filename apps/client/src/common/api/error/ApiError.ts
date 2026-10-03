import type { ValidationIssueDto } from "@citadel/specs/src/specUtils/error/validationIssueDto.type";

type ApiErrorDetail = {
	// null : aucune réponse du serveur (réseau coupé, serveur éteint)
	status: number | null;
	// null : pas de réponse, ou corps illisible (page d'erreur d'un proxy…)
	code: string | null;
	issues?: ValidationIssueDto[];
	cause?: unknown;
};

// Échec d'un appel à l'API, seule erreur que renvoie fetchHandler. Son message ne s'affiche jamais : l'UI traduit `code`
export class ApiError extends Error {
	readonly status: number | null;

	readonly code: string | null;

	readonly issues: ValidationIssueDto[];

	constructor({ status, code, issues = [], cause }: ApiErrorDetail) {
		super(
			status === null
				? "No response from the API"
				: `API answered ${status} ${code ?? "without error code"}`,
			{ cause },
		);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.issues = issues;
	}
}
