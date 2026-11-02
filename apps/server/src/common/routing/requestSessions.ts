import type { AuthenticatedSessionBean } from "../../projects/auth/bean/authenticatedSessionBean.type.ts";

// Clé : la requête, quel que soit son typage (celle d'un contrôleur typé comme celle d'un middleware)
const sessionByRequest = new WeakMap<object, AuthenticatedSessionBean>();

// La session trouvée par requireSession, rangée à côté de la requête (typée, contrairement à response.locals). La
// requête terminée, elle disparaît avec elle
export const requestSessions = {
	attach(request: object, session: AuthenticatedSessionBean): void {
		sessionByRequest.set(request, session);
	},

	get(request: object): AuthenticatedSessionBean | undefined {
		return sessionByRequest.get(request);
	},
};
