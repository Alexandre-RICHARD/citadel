import type { SessionBean } from "../../../bean/sessionBean.type.ts";
import { describeUserAgent } from "../../../helper/session/describeUserAgent.ts";
import type { Session } from "../../../models/Session.ts";

export function fromSessionEntityToSessionBean(
	session: Session,
	currentSessionId: number,
): SessionBean {
	return {
		id: session.id,
		...describeUserAgent(session.userAgent),
		ip: session.ip,
		createdAt: session.createdAt,
		lastSeenAt: session.lastSeenAt,
		expiresAt: session.expiresAt,
		isCurrent: session.id === currentSessionId,
	};
}
