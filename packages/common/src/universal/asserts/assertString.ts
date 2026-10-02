import { assert } from "./assert.ts";

export function assertString(
	value: unknown,
	errorContext?: string,
): asserts value is string {
	assert(
		typeof value === "string",
		`${errorContext ?? "assertString"} → value is not a string`,
	);
}
