import { z } from "zod";

const REQUIRED_STRING_MIN_LENGTH = 1;

export function requiredStringSchema(label: string, maxLength: number) {
	return z
		.string({ message: `${label} should be a string` })
		.trim()
		.min(REQUIRED_STRING_MIN_LENGTH, {
			message: `${label} should contain at least ${REQUIRED_STRING_MIN_LENGTH} character`,
		})
		.max(maxLength, {
			message: `${label} should contain at most ${maxLength} characters`,
		});
}
