import type { seriesChoiceSchema } from "@citadel/specs/src/projects/backlog/schema/seriesChoiceSchema";
import type { z } from "zod";

// Série choisie pour un jeu du backlog : la proposée, une autre, une nouvelle, ou aucune
export type SeriesChoice = z.output<typeof seriesChoiceSchema>;
