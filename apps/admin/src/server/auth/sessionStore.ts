import { randomBytes } from "node:crypto";

// Sessions en mémoire : un redémarrage de la console déconnecte, rien n'est écrit sur disque
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const sessions = new Map<string, number>();

function forgetExpired(now: number): void {
	for (const [token, expiresAt] of sessions)
		if (expiresAt <= now) sessions.delete(token);
}

export const sessionStore = {
	durationMs: SESSION_DURATION_MS,

	create(): string {
		const now = Date.now();
		forgetExpired(now);
		const token = randomBytes(32).toString("base64url");
		sessions.set(token, now + SESSION_DURATION_MS);
		return token;
	},

	isValid(token: string | undefined): boolean {
		if (token === undefined) return false;
		const expiresAt = sessions.get(token);
		return expiresAt !== undefined && expiresAt > Date.now();
	},

	delete(token: string | undefined): void {
		if (token !== undefined) sessions.delete(token);
	},
};
