import { z } from "zod";

export function booleanSchema(label: string) {
	return z.boolean({ message: `${label} should be a boolean` });
}
