import { Navigate, Outlet, useLocation } from "react-router";

import { SignInStateEnum } from "../../projects/auth/api/me/signInState.enum";
import { useSignInState } from "../../projects/auth/api/me/useSignInState";
import { buildLoginPath } from "../../projects/auth/routing/buildLoginPath";

/**
 * Les projets privés (Game Death Counter, Backlog) : un visiteur non connecté passe par la connexion, qui le ramène à
 * la page demandée. Le temps de le savoir, rien ne s'affiche et le rideau de la transition reste en place. Serveur
 * injoignable : le projet s'ouvre quand même, et ses propres lectures disent l'erreur
 */
export function ProjectAccessGuard() {
	const signInState = useSignInState();
	const { pathname, search, hash } = useLocation();

	if (signInState === SignInStateEnum.PENDING) return null;
	if (signInState === SignInStateEnum.SIGNED_OUT)
		return (
			<Navigate
				to={buildLoginPath(`${pathname}${search}${hash}`)}
				replace
			/>
		);
	return <Outlet />;
}
