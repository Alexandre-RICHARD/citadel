import { readFile } from "node:fs/promises";

import type { SiteStatus } from "../../shared/siteStatus.type.ts";
import { env } from "../configuration/env.ts";
import { parseDeployHistory } from "./parseDeployHistory.ts";
import { readMailFailureSummary } from "./readMailFailureSummary.ts";
import { readUnsentContactCount } from "./readUnsentContactCount.ts";

const HISTORY_LIMIT = 15;

// Fichier absent (aucun déploiement, ou ton PC) : rien, sans erreur
async function readOptional(fileName: string): Promise<string> {
	try {
		return await readFile(`${env.STATE_DIR}/${fileName}`, "utf8");
	} catch {
		return "";
	}
}

// Ce que citadel écrit à chaque déploiement, dans /Volume1/citadel/state, et ce que le serveur du site n'a pas pu envoyer :
// des mails, et des messages de contact (gardés en base)
export async function readSiteStatus(): Promise<SiteStatus> {
	const [currentVersion, history, mailFailures, unsentContactMessages] =
		await Promise.all([
			readOptional("current-version"),
			readOptional("deploy-history.log"),
			readMailFailureSummary(),
			readUnsentContactCount(),
		]);
	return {
		currentVersion: currentVersion.trim() || null,
		history: parseDeployHistory(history, HISTORY_LIMIT),
		mailFailures,
		unsentContactMessages,
	};
}
