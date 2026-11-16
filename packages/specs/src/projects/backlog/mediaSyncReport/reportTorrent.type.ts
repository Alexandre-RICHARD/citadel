import type { z } from "zod";

import type { reportTorrentSchema } from "./reportTorrentSchema.ts";

export type ReportTorrent = z.infer<typeof reportTorrentSchema>;
