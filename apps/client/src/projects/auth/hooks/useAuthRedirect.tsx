import { useSessionStorage } from "@citadel/common/src/react/hooks/useSessionStorage";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { ProjectsEnum } from "../../../react/appNavigation/projects.enum";
import { projects } from "../../../react/appNavigation/projectsDictionary";
import { resolveRedirectPath } from "../helper/resolveRedirectPath";

const REDIRECT_KEY = "citadel:auth:redirect";
// Sans page demandée : l'accueil du site (le profil prendra sa place quand il existera)
const DEFAULT_TARGET = projects[ProjectsEnum.Homepage].path;

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

	return resolveRedirectPath(requested ?? stored.value, DEFAULT_TARGET);
}
