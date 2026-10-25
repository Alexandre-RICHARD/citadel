import type { TailscaleDevice } from "./tailscaleDevice.type.ts";
import type { Unavailable } from "./unavailable.type.ts";

export type TailscaleStatus =
	| {
			available: true;
			// Date ISO du relevé d'infra-ops (une fois par minute)
			collectedAt: string;
			// En ligne d'abord
			devices: TailscaleDevice[];
	  }
	| Unavailable;
