import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import type { Request } from "express";

import type { NasSettings } from "../../../../configuration/nasSettings.type.ts";
import { ForbiddenError } from "../../../../error/ForbiddenError.ts";
import { isUnlockTokenValid } from "./isUnlockTokenValid.ts";
import { nasOwner } from "./nasOwner.ts";
import { unlockCookie } from "./unlockCookie.ts";

// Toute lecture ou écriture du NAS : le compte du propriétaire, déverrouillé par le mot de passe des médias
export function assertNasUnlocked(
	settings: NasSettings,
	request: Pick<Request, "headers">,
	userId: number,
): void {
	if (!nasOwner.isOwner(settings, userId))
		throw new ForbiddenError(
			BacklogErrorCodeEnum.NAS_OWNER_ONLY,
			"Only the NAS owner can use the connected mode",
		);
	if (
		!isUnlockTokenValid(
			unlockCookie.read(request),
			userId,
			settings.passwordHash,
			Date.now(),
		)
	)
		throw new ForbiddenError(
			BacklogErrorCodeEnum.NAS_LOCKED,
			"Connected mode is locked",
		);
}
