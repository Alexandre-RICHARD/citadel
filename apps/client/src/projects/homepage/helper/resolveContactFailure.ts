import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum";

import { ApiError } from "../../../common/api/error/ApiError";
import { buildFailureMessage } from "../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../common/api/error/getErrorReason";
import { isTransientApiError } from "../../../common/api/error/isTransientApiError";
import { contactErrorReasons } from "../api/contact/contactErrorReasons";
import { contactFieldLabels } from "../api/contact/contactFieldLabels";
import type { ContactFailure } from "./contactFailure.type";

const SECOND_MS = 1000;

export function resolveContactFailure(
	error: unknown,
	now: number,
): ContactFailure {
	if (
		error instanceof ApiError &&
		error.status === Number(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS) &&
		error.retryAfterSeconds !== null
	)
		return { kind: "wait", retryAt: now + error.retryAfterSeconds * SECOND_MS };

	return {
		kind: "message",
		message: buildFailureMessage(
			"envoyer le message",
			getErrorReason(error, {
				projectReasons: contactErrorReasons,
				fieldLabels: contactFieldLabels,
			}),
		),
		isRetryable: isTransientApiError(error),
	};
}
