import type { Request } from "express";

import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import { flowCookie } from "../cookie/flowCookie.ts";
import { sessionCookie } from "../cookie/sessionCookie.ts";

// `request.ip` : l'IP réelle, posée par le middleware realClientIp
export function readBrowserContext(
	request: Pick<Request, "headers" | "ip">,
): BrowserContextBean {
	return {
		client: {
			ip: request.ip ?? "unknown",
			userAgent: request.headers["user-agent"] ?? null,
		},
		sessionToken: sessionCookie.read(request),
		flowToken: flowCookie.read(request),
	};
}
