import { expect } from "vitest";

// Pour une date posée par le serveur (« maintenant ») : elle doit tomber pendant la requête
export function expectDateBetween(date: Date, start: Date, end: Date): void {
	expect(date.getTime()).toBeGreaterThanOrEqual(start.getTime());
	expect(date.getTime()).toBeLessThanOrEqual(end.getTime());
}
