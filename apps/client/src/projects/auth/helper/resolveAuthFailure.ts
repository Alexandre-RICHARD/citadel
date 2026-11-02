import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum";

import { ApiError } from "../../../common/api/error/ApiError";
import { buildFailureMessage } from "../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../common/api/error/getErrorReason";
import { isTransientApiError } from "../../../common/api/error/isTransientApiError";
import { authErrorReasons } from "../api/authErrorReasons";
import { authFieldLabels } from "../api/authFieldLabels";
import type { AuthFailure } from "./authFailure.type";

const SECOND_MS = 1000;
// Les réponses qui annoncent quand réessayer : délai entre deux essais, limite de mails, serveur occupé
const WAIT_STATUSES: readonly number[] = [
	HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS,
	HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE,
];

// L'échec d'une étape de l'authentification, prêt à afficher : « Impossible de {action} : {raison}. »
export function resolveAuthFailure(
	error: unknown,
	actionLabel: string,
	now: number,
): AuthFailure {
	const code = error instanceof ApiError ? error.code : null;
	if (
		error instanceof ApiError &&
		error.status !== null &&
		WAIT_STATUSES.includes(error.status) &&
		error.retryAfterSeconds !== null
	)
		return {
			kind: "wait",
			retryAt: now + error.retryAfterSeconds * SECOND_MS,
			code,
		};

	return {
		kind: "message",
		message: buildFailureMessage(
			actionLabel,
			getErrorReason(error, {
				projectReasons: authErrorReasons,
				fieldLabels: authFieldLabels,
			}),
		),
		code,
		isRetryable: isTransientApiError(error),
	};
}
