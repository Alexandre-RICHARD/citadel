import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";

// Les emails pointent toujours vers le domaine de la prod : on garde le chemin et le fragment (le jeton), sur le site de test
export function extractLink(text: string): string | null {
	const link = /https?:\/\/\S+\/auth\/\S+/.exec(text)?.[0];
	if (link === undefined) return null;
	const { pathname, search, hash } = new URL(link);
	return `${E2EUrlEnum.SITE_URL}${pathname}${search}${hash}`;
}
