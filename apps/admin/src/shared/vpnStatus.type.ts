import type { Unavailable } from "./unavailable.type.ts";

export type VpnStatus =
	| {
			available: true;
			publicIp: string | null;
			country: string | null;
			city: string | null;
			// Le port ouvert par ProtonVPN vers qBittorrent ; null s'il n'y en a pas encore
			forwardedPort: number | null;
	  }
	| Unavailable;
