import { useSessionStorage } from "@citadel/common/src/react/hooks/useSessionStorage";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { resolveRedirectPath } from "../helper/resolveRedirectPath";
import { AuthPathEnum } from "../routing/authPath.enum";

const REDIRECT_KEY = "citadel:auth:redirect";

/**
 * La page où revenir une fois connecté : celle de `?redirect=…`, gardée le temps de l'onglet, car le parcours peut passer
 * par d'autres pages du compte (inscription, mot de passe oublié) avant de finir
 */
export function useAuthRedirect(): string {
	const [searchParams] = useSearchParams();
	const requested = searchParams.get("redirect");
	const stored = useSessionStorage<string>(REDIRECT_KEY, null);
	const { set } = stored;

	useEffect(() => {
		if (requested !== null) set(requested);
	}, [requested, set]);

	// Sans page demandée : le profil
	return resolveRedirectPath(requested ?? stored.value, AuthPathEnum.PROFILE);
}
