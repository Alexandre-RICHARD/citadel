// Journal des actions (§14.4) : une ligne JSON par connexion ou action, dans les logs du
// conteneur (docker logs infra-admin, ou la console elle-même)
export function writeAuditLog(entry: Record<string, unknown>): void {
	process.stdout.write(
		`${JSON.stringify({ time: new Date().toISOString(), ...entry })}\n`,
	);
}
