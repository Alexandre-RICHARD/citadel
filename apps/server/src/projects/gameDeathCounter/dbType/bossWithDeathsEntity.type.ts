import type { Boss } from "../models/Boss.ts";
import type { Death } from "../models/Death.ts";

// Boss chargé avec `include: deaths` : `deaths` est garanti présent
export type BossWithDeathsEntity = Boss & { deaths: Death[] };
