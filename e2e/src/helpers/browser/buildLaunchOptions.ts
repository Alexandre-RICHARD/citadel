import { findBrowserPath } from "./findBrowserPath.ts";

/** Les options de lancement du navigateur : son chemin s'il est trouvé, et un délai entre chaque action (slowMo, en ms) */
export function buildLaunchOptions(slowMo?: number) {
	const executablePath = findBrowserPath();
	return {
		...(executablePath !== undefined && { executablePath }),
		...(slowMo !== undefined && { slowMo }),
	};
}
