// « restarting » compte comme allumé : Docker le relance déjà
export function isRunningState(state: string): boolean {
	return state === "running" || state === "restarting";
}
