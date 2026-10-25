import { type Response, Router } from "express";

import type { SiteStatus } from "../shared/siteStatus.type.ts";
import type { SystemSnapshot } from "../shared/systemSnapshot.type.ts";
import type { TorrentStats } from "../shared/torrentStats.type.ts";
import type { VpnStatus } from "../shared/vpnStatus.type.ts";
import { readSiteStatus } from "./site/readSiteStatus.ts";
import { readSystemSnapshot } from "./system/readSystemSnapshot.ts";
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
