import type { customizationSchema } from "@citadel/specs/src/projects/backlog/schema/customizationSchema";
import type { z } from "zod";

// Personnalisation d'un jeu du backlog en cours de saisie : à l'ajout au backlog ou par « Personnaliser »
export type CustomizationDraft = z.output<typeof customizationSchema>;
