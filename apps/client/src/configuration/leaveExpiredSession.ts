import type { QueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "../projects/auth/api/authQueryKeys";
import { findSessionExpiredRedirect } from "../projects/auth/routing/findSessionExpiredRedirect";
import { router } from "../react/appNavigation/routes";

/**
 * La session n'ouvre plus le compte : le cache est vidé (les données d'un compte ne restent jamais à l'écran d'un
 * autre), le site se sait déconnecté sans relire GET /auth/me, et la connexion ramènera à la page où l'on était
 */
export function leaveExpiredSession(queryClient: QueryClient): void {
	queryClient.clear();
	queryClient.setQueryData(authQueryKeys.me(), null);
	const { pathname, search, hash } = window.location;
	const redirect = findSessionExpiredRedirect(`${pathname}${search}${hash}`);
	if (redirect !== null) void router.navigate(redirect, { replace: true });
}
