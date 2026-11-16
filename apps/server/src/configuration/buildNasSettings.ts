type NasVariables = {
	MEDIA_STATE_DIR?: string | undefined;
	MEDIA_PASSWORD_HASH?: string | undefined;
	MEDIA_OWNER_USER_ID?: number | undefined;
	MEDIA_UNLOCK_HOURS: number;
	MEDIA_JELLYFIN_PORT: number;
	MEDIA_CONSOLE_PORT: number;
};

const HOUR_MS = 60 * 60 * 1000;

/**
 * Le mode connecté du backlog des médias, ou null : seule l'instance locale du NAS a MEDIA_STATE_DIR, et ses routes
 * n'existent que chez elle. env.ts a déjà exigé le mot de passe et le propriétaire quand le dossier est posé
 */
export function buildNasSettings(variables: NasVariables) {
	const {
		MEDIA_STATE_DIR: stateDir,
		MEDIA_PASSWORD_HASH: passwordHash,
		MEDIA_OWNER_USER_ID: ownerUserId,
	} = variables;
	if (
		stateDir === undefined ||
		passwordHash === undefined ||
		ownerUserId === undefined
	)
		return null;
	return {
		stateDir,
		passwordHash,
		ownerUserId,
		unlockDurationMs: variables.MEDIA_UNLOCK_HOURS * HOUR_MS,
		jellyfinPort: variables.MEDIA_JELLYFIN_PORT,
		consolePort: variables.MEDIA_CONSOLE_PORT,
	};
}
