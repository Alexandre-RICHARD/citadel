import type { z } from "zod";

import type { nasTorrentSchema } from "./nasTorrentSchema.ts";

export type NasTorrent = z.infer<typeof nasTorrentSchema>;
