import type { Response } from "express";

import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import { flowCookie } from "./flowCookie.ts";
import { sessionCookie } from "./sessionCookie.ts";

// Le parcours continue : son cookie, avec sa nouvelle fin. Il se termine : la session, et plus de cookie de parcours
export function writeFlowOutcomeCookies(
	response: Pick<Response, "cookie" | "clearCookie">,
	outcome: FlowOutcomeBean,
): void {
	if (outcome.isCompleted) {
		sessionCookie.set(response, outcome.sessionCookie);
		flowCookie.clear(response);
		return;
	}
	flowCookie.set(response, outcome.flowCookie);
}
