import type { TailscaleDevice } from "../../shared/tailscaleDevice.type.ts";

// state/tailscale.json, écrit chaque minute par infra-ops (citadel tailscale-status) à
// partir de `tailscale status --json`, déjà réduit à ce que la console affiche
export type TailscaleStateFile = {
	collectedAt: string;
	// La clé du NAS dans le tailnet ; null : expiration désactivée (§12.4)
	selfKeyExpiry: string | null;
	devices: TailscaleDevice[];
};
