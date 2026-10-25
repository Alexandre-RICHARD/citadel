import { readFile } from "node:fs/promises";

import type { SiteStatus } from "../../shared/siteStatus.type.ts";
import { env } from "../configuration/env.ts";
import { parseDeployHistory } from "./parseDeployHistory.ts";

const HISTORY_LIMIT = 15;

// Fichier absent (aucun déploiement, ou ton PC) : rien, sans erreur
async function readOptional(fileName: string): Promise<string> {
	try {
		return await readFile(`${env.STATE_DIR}/${fileName}`, "utf8");
	} catch {
		return "";
	}
}

// Ce que citadel écrit à chaque déploiement, dans /Volume1/citadel/state
export async function readSiteStatus(): Promise<SiteStatus> {
	const [currentVersion, history] = await Promise.all([
		readOptional("current-version"),
		readOptional("deploy-history.log"),
	]);
	return {
		currentVersion: currentVersion.trim() || null,
		history: parseDeployHistory(history, HISTORY_LIMIT),
	};
}
