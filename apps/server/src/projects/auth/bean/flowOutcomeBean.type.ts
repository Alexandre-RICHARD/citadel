import type { FlowBean } from "./flowBean.type.ts";
import type { FlowCookieBean } from "./flowCookieBean.type.ts";
import type { SessionCookieBean } from "./sessionCookieBean.type.ts";

// Ce que devient le navigateur après une étape : un parcours qui continue (son cookie est posé), ou une session ouverte
// (le cookie de session posé, celui du parcours effacé)
export type FlowOutcomeBean =
	| { isCompleted: false; flow: FlowBean; flowCookie: FlowCookieBean }
	| { isCompleted: true; sessionCookie: SessionCookieBean };
