import { AuthPathEnum } from "./authPath.enum";

// La connexion, qui ramène ensuite à `redirect` (une page de ce site : resolveRedirectPath écarte le reste)
export function buildLoginPath(redirect: string): string {
	return `${AuthPathEnum.LOGIN}?redirect=${encodeURIComponent(redirect)}`;
}
