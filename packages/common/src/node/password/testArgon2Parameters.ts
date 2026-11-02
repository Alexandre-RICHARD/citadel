import type { Argon2Parameters } from "./argon2Parameters.type.ts";

// Des paramètres minuscules : les tests restent rapides, le calcul est le même
export const TEST_ARGON2_PARAMETERS: Argon2Parameters = {
	memoryKib: 64,
	passes: 1,
	parallelism: 1,
};
