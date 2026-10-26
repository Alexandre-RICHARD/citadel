import type { newUserVersionSchema } from "@citadel/specs/src/projects/backlog/schema/newUserVersionSchema";
import type { z } from "zod";

// Nouvelle version jouée en cours de saisie : la version et la plateforme restent à choisir
export type UserVersionDraft = Omit<
	z.output<typeof newUserVersionSchema>,
	"versionId" | "platformId"
> & {
	versionId: number | null;
	platformId: number | null;
};
