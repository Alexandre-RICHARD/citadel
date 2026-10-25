import type { TailscaleStatus } from "../../shared/tailscaleStatus.type.ts";
import { readTailscaleStateFile } from "./readTailscaleStateFile.ts";

export async function readTailscaleStatus(): Promise<TailscaleStatus> {
	const state = await readTailscaleStateFile();
	if (!state)
		return {
			available: false,
			reason: "Aucun relevé (job tailscale-status d'infra-ops)",
		};
	return {
		available: true,
		collectedAt: state.collectedAt,
		devices: [...state.devices].sort(
			(first, second) =>
				Number(second.online) - Number(first.online) ||
				first.name.localeCompare(second.name, "fr"),
		),
	};
}
