import { type Response, Router } from "express";

import type { DeadlineItem } from "../shared/deadlineItem.type.ts";
import type { JellyfinActivity } from "../shared/jellyfinActivity.type.ts";
import type { SiteStatus } from "../shared/siteStatus.type.ts";
import type { SiteTraffic } from "../shared/siteTraffic.type.ts";
import type { SystemSnapshot } from "../shared/systemSnapshot.type.ts";
import type { TailscaleStatus } from "../shared/tailscaleStatus.type.ts";
import type { TorrentStats } from "../shared/torrentStats.type.ts";
import type { VpnStatus } from "../shared/vpnStatus.type.ts";
import { readJellyfinActivity } from "./access/readJellyfinActivity.ts";
import { readSiteTraffic } from "./access/readSiteTraffic.ts";
import { readDeadlines } from "./deadlines/readDeadlines.ts";
import { readSiteStatus } from "./site/readSiteStatus.ts";
import { readSystemSnapshot } from "./system/readSystemSnapshot.ts";
import { readTailscaleStatus } from "./tailscale/readTailscaleStatus.ts";
import { readTorrentStats } from "./torrent/readTorrentStats.ts";
import { readVpnStatus } from "./vpn/readVpnStatus.ts";

// Les cartes du haut de la console : une route par source, chacune relue à son rythme
export const overviewRouter = Router();

overviewRouter.get(
	"/api/system",
	async (_request, response: Response<SystemSnapshot>) => {
		response.json(await readSystemSnapshot());
	},
);

overviewRouter.get(
	"/api/vpn",
	async (_request, response: Response<VpnStatus>) => {
		response.json(await readVpnStatus());
	},
);

overviewRouter.get(
	"/api/torrents",
	async (_request, response: Response<TorrentStats>) => {
		response.json(await readTorrentStats());
	},
);

overviewRouter.get(
	"/api/site",
	async (_request, response: Response<SiteStatus>) => {
		response.json(await readSiteStatus());
	},
);

overviewRouter.get(
	"/api/deadlines",
	async (_request, response: Response<DeadlineItem[]>) => {
		response.json(await readDeadlines());
	},
);

// Accès externes (fonctionnalité 6) : le site par les logs de Caddy, Jellyfin, Tailscale
overviewRouter.get(
	"/api/traffic",
	async (_request, response: Response<SiteTraffic>) => {
		response.json(await readSiteTraffic());
	},
);

overviewRouter.get(
	"/api/jellyfin",
	async (_request, response: Response<JellyfinActivity>) => {
		response.json(await readJellyfinActivity());
	},
);

overviewRouter.get(
	"/api/tailscale",
	async (_request, response: Response<TailscaleStatus>) => {
		response.json(await readTailscaleStatus());
	},
);
