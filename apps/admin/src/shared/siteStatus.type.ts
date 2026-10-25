import type { DeployHistoryEntry } from "./deployHistoryEntry.type.ts";

export type SiteStatus = {
	// null : aucun déploiement (sur ton PC, avec pnpm prod:local)
	currentVersion: string | null;
	// Le plus récent en premier
	history: DeployHistoryEntry[];
};
