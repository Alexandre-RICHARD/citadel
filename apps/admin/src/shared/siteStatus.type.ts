import type { DeployHistoryEntry } from "./deployHistoryEntry.type.ts";
import type { MailFailureSummary } from "./mailFailureSummary.type.ts";

export type SiteStatus = {
	// null : aucun déploiement (sur ton PC, avec pnpm prod:local)
	currentVersion: string | null;
	// Les messages de contact gardés en base, à lire ; null : le serveur du site ne répond pas
	unsentContactMessages: number | null;
	// Le plus récent en premier
	history: DeployHistoryEntry[];
	// null : le serveur du site ne répond pas (arrêté, ou ton PC sans pnpm prod:local)
	mailFailures: MailFailureSummary | null;
};
