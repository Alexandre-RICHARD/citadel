import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { RejectedRequestError } from "../../../../error/RejectedRequestError.ts";

// Plus de parcours à cette étape (expiré, abandonné, terminé ailleurs) : il faut recommencer
export function flowExpiredError(message: string): RejectedRequestError {
	return new RejectedRequestError(AuthErrorCodeEnum.FLOW_EXPIRED, message);
}
