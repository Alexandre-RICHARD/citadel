import { access, readFile } from "node:fs/promises";

import type { BackupItem } from "../../shared/backupItem.type.ts";
import type { OperationsStatus } from "../../shared/operationsStatus.type.ts";
import type { SiteBanner } from "../../shared/siteBanner.type.ts";
import { env } from "../configuration/env.ts";
import { readStateJson } from "../state/readStateJson.ts";
import { readStateText } from "../state/readStateText.ts";
import { findPreviousVersion } from "./findPreviousVersion.ts";

type UpdatesFile = { checkedAt: string; versions: string[] };
type BackupsFile = { driveError: string | null; items: BackupItem[] };

// Ce que Caddy sert au site (state/public du NAS)
async function readPublic<T>(fileName: string): Promise<T | null> {
	try {
		return JSON.parse(
			await readFile(`${env.PUBLIC_DIR}/${fileName}`, "utf8"),
		) as T;
	} catch {
		return null;
	}
}

async function isMaintenanceOn(): Promise<boolean> {
	try {
		await access(`${env.PUBLIC_DIR}/maintenance.on`);
		return true;
	} catch {
		return false;
	}
}

// Versions (en service, précédente, publiées), dumps, bandeau, mode maintenance : tout
// vient des fichiers écrits par citadel et infra-ops
export async function readOperationsStatus(): Promise<OperationsStatus> {
	const [current, history, updates, backups, banner, maintenance] =
		await Promise.all([
			readStateText("current-version"),
			readStateText("deploy-history.log"),
			readStateJson<UpdatesFile>("updates.json"),
			readStateJson<BackupsFile>("backups.json"),
			readPublic<SiteBanner>("banner.json"),
			isMaintenanceOn(),
		]);
	// Fichier vide ou absent : aucun déploiement
	const trimmed = current?.trim() ?? "";
	const currentVersion = trimmed === "" ? null : trimmed;
	return {
		currentVersion,
		previousVersion: findPreviousVersion(history ?? "", currentVersion),
		publishedVersions: updates?.versions ?? [],
		versionsCheckedAt: updates?.checkedAt ?? null,
		backups: backups?.items ?? [],
		backupsDriveError: backups?.driveError ?? null,
		banner,
		maintenance,
	};
}
