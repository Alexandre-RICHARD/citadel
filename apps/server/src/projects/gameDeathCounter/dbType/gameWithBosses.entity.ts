import type { Boss } from "../models/Boss.ts";
import type { Game } from "../models/Game.ts";

// Jeu chargé avec `include: bosses` : `bosses` est garanti présent
export type GameWithBossesEntity = Game & { bosses: Boss[] };
