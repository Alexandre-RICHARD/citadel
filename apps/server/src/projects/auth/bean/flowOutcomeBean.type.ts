import type { FlowBean } from "./flowBean.type.ts";
import type { FlowCookieBean } from "./flowCookieBean.type.ts";
import type { SessionCookieBean } from "./sessionCookieBean.type.ts";

/**
 * Ce que devient le navigateur après une étape : un parcours qui continue (son cookie est posé), ou un parcours terminé
 * (celui du parcours effacé). Terminé, il ouvre une session (son cookie posé), sauf l'activation du facteur mail
 * (sessionCookie null : déjà connecté), qui donne les codes de secours du premier facteur du compte
 */
export type FlowOutcomeBean =
	| { isCompleted: false; flow: FlowBean; flowCookie: FlowCookieBean }
	| {
			isCompleted: true;
			sessionCookie: SessionCookieBean | null;
			recoveryCodes: string[] | null;
	  };
