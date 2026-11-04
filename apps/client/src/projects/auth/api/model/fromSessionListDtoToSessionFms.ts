import type { SessionListDto } from "@citadel/specs/src/projects/auth/dto/sessionListDto.type";

import type { SessionFm } from "./sessionFm.type";

export function fromSessionListDtoToSessionFms(
	dto: SessionListDto,
): SessionFm[] {
	return dto.sessions.map((session) => ({
		id: session.id,
		browser: session.browser,
		system: session.system,
		ip: session.ip,
		createdAt: Date.parse(session.createdAt),
		lastSeenAt: Date.parse(session.lastSeenAt),
		expiresAt: Date.parse(session.expiresAt),
		isCurrent: session.isCurrent,
	}));
}
