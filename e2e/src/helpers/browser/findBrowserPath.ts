import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const EDGE_CORE_FOLDER = "C:\\Program Files (x86)\\Microsoft\\EdgeCore";
const VERSION_FOLDER = /^\d+(\.\d+)+$/;

/**
 * Le navigateur à lancer. Priorité : la variable E2E_BROWSER_PATH, puis le dossier EdgeCore de Windows
 * (installé avec Edge, son nom de version change à chaque mise à jour : on prend le plus récent), puis
 * undefined = le Chromium que Playwright télécharge (`pnpm install-browser`), qu'une stratégie de contrôle
 * d'application de Windows peut bloquer
 */
export function findBrowserPath(): string | undefined {
	const fromEnvironment = process.env.E2E_BROWSER_PATH;
	if (fromEnvironment !== undefined && fromEnvironment !== "")
		return fromEnvironment;
	if (!existsSync(EDGE_CORE_FOLDER)) return undefined;
	const [latestVersion] = readdirSync(EDGE_CORE_FOLDER)
		.filter((folder) => VERSION_FOLDER.test(folder))
		.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
	if (latestVersion === undefined) return undefined;
	const executable = join(EDGE_CORE_FOLDER, latestVersion, "msedge.exe");
	return existsSync(executable) ? executable : undefined;
}
