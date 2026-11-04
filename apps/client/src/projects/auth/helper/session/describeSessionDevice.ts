// Ce qui fait reconnaître une session : « Firefox sur Windows ». Un navigateur ou un système inconnu n'est jamais deviné
export function describeSessionDevice(
	browser: string | null,
	system: string | null,
): string {
	if (browser !== null && system !== null) return `${browser} sur ${system}`;
	return browser ?? system ?? "Appareil inconnu";
}
