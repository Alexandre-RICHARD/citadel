import { readFile } from "node:fs/promises";

import { env } from "../configuration/env.ts";
import type { TailscaleStateFile } from "./tailscaleStateFile.type.ts";

// null : pas encore de relevé (infra-ops vient de démarrer, ou Tailscale n'a jamais
// tourné, comme avec pnpm prod:local)
export async function readTailscaleStateFile(): Promise<TailscaleStateFile | null> {
	try {
		return JSON.parse(
			await readFile(`${env.STATE_DIR}/tailscale.json`, "utf8"),
		) as TailscaleStateFile;
	} catch {
		return null;
	}
}
