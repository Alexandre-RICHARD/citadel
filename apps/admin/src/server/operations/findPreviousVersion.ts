// La version où `citadel rollback` reviendrait : la dernière déployée avec succès qui
// n'est pas celle en service. Même règle que citadel (previous_version), sur les lignes
// « 2026-10-25 15:02:11  v2026.10.25  ok  (depuis …) » de deploy-history.log.
export function findPreviousVersion(
	history: string,
	currentVersion: string | null,
): string | null {
	const successful = history
		.split("\n")
		.filter((line) => line.includes("  ok  "))
		.map((line) => line.split(/\s+/)[2] ?? "")
		.filter((version) => version !== "" && version !== currentVersion);
	return successful.at(-1) ?? null;
}
