import { onTestFinished, vi } from "vitest";

/**
 * Fige l'horloge (Date.now, new Date) le temps du test, puis `advance` la fait avancer d'un coup : une expiration de
 * 30 jours se teste sans attendre. Seule Date est simulée : les minuteries (pool de la base, supertest) restent vraies.
 * Les dates sont calculées par Node, jamais par NOW() en SQL : la base suit donc la même horloge
 */
export function useFakeClock(startAt = new Date("2026-11-02T10:00:00.000Z")) {
	vi.useFakeTimers({ toFake: ["Date"], now: startAt });
	onTestFinished(() => {
		vi.useRealTimers();
	});

	return {
		advance(milliseconds: number): void {
			vi.setSystemTime(Date.now() + milliseconds);
		},
	};
}
