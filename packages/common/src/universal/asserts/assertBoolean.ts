import { assert } from "./assert.ts";

export function assertBoolean(
	value: unknown,
	errorContext?: string,
): asserts value is boolean {
	assert(
		typeof value === "boolean",
		`${errorContext ?? "assertBoolean"} → value is not a boolean`,
	);
}
