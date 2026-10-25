import type { ServiceItem } from "./serviceItem.type.ts";

// Ce dont le planificateur a besoin d'un service
export type PlannableService = Pick<
	ServiceItem,
	"name" | "state" | "dependsOn"
>;
