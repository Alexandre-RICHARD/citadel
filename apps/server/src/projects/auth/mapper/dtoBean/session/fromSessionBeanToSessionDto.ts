import type { SessionDto } from "@citadel/specs/src/projects/auth/dto/sessionDto.type.ts";

import type { SessionBean } from "../../../bean/sessionBean.type.ts";

export function fromSessionBeanToSessionDto(session: SessionBean): SessionDto {
	return {
		id: session.id,
		browser: session.browser,
		system: session.system,
		ip: session.ip,
		createdAt: session.createdAt.toISOString(),
		lastSeenAt: session.lastSeenAt.toISOString(),
		expiresAt: session.expiresAt.toISOString(),
		isCurrent: session.isCurrent,
	};
}
