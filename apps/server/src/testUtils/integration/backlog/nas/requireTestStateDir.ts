import { nasSettings } from "../../../../configuration/nasSettings.ts";

// Le media-state jetable des tests (configureNasTestEnvironment)
export function requireTestStateDir(): string {
	if (nasSettings === null)
		throw new Error("Tests d'intégration sans MEDIA_STATE_DIR");
	return nasSettings.stateDir;
}
