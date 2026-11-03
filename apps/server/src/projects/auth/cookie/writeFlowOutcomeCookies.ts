import type { Response } from "express";

import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import { flowCookie } from "./flowCookie.ts";
import { sessionCookie } from "./sessionCookie.ts";

// Le parcours continue : son cookie, avec sa nouvelle fin. Il se termine : plus de cookie de parcours, et la session
// qu'il ouvre
export function writeFlowOutcomeCookies(
	response: Pick<Response, "cookie" | "clearCookie">,
	outcome: FlowOutcomeBean,
): void {
	if (!outcome.isCompleted) {
		flowCookie.set(response, outcome.flowCookie);
		return;
	}
	if (outcome.sessionCookie !== null)
		sessionCookie.set(response, outcome.sessionCookie);
	flowCookie.clear(response);
}
