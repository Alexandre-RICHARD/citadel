import { z } from "zod";

// Date ISO 8601 (avec décalage horaire accepté), qui ne peut pas être dans le futur
export function pastIsoDateTimeSchema(label: string) {
	return z.iso
		.datetime({
			offset: true,
			message: `${label} should be an ISO 8601 datetime`,
			abort: true,
		})
		.refine((date) => new Date(date).getTime() <= Date.now(), {
			message: `${label} should not be in the future`,
		});
}
