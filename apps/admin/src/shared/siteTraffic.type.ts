import type { AccessEntry } from "./accessEntry.type.ts";
import type { IpActivity } from "./ipActivity.type.ts";
import type { Unavailable } from "./unavailable.type.ts";

export type SiteTraffic =
	| {
			available: true;
			windowHours: number;
			requestCount: number;
			uniqueIpCount: number;
			scanCount: number;
			// true : plus de requêtes que la console n'en lit, les totaux sont partiels
			truncated: boolean;
			topIps: IpActivity[];
			// Les plus récentes d'abord. Pages et API du site, sans fichiers ni Jellyfin
			recentRequests: AccessEntry[];
			recentScans: AccessEntry[];
	  }
	| Unavailable;
