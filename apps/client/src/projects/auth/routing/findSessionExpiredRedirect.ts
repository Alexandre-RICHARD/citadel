import { AuthPathEnum } from "./authPath.enum";
import { buildLoginPath } from "./buildLoginPath";

/**
 * Où mener un visiteur dont la session vient d'expirer : la connexion, qui le ramènera à la page où il était. null sur
 * la page de connexion elle-même, qui n'a pas à se recharger en boucle
 */
export function findSessionExpiredRedirect(currentPath: string): string | null {
	const pathname = currentPath.split(/[?#]/u)[0] ?? "";
	if (pathname === String(AuthPathEnum.LOGIN)) return null;
	return buildLoginPath(currentPath);
}
