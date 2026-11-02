import type { Argon2Parameters } from "./argon2Parameters.type.ts";

// Le minimum recommandé par l'OWASP (Password Storage Cheat Sheet) : 19 Mio, 2 passes, 1 fil
export const OWASP_ARGON2_PARAMETERS: Argon2Parameters = {
	memoryKib: 19_456,
	passes: 2,
	parallelism: 1,
};
