import { describe, expect, it } from "vitest";

import { fromSessionListDtoToSessionFms } from "./fromSessionListDtoToSessionFms";

describe("fromSessionListDtoToSessionFms.ts", () => {
	describe("sessions", () => {
		it("SHOULD turn the ISO dates into browser times and keep the rest", () => {
			expect(
				fromSessionListDtoToSessionFms({
					sessions: [
						{
							id: 9,
							browser: "Firefox",
							system: null,
							ip: "203.0.113.0/24",
							createdAt: "2026-11-03T10:00:00.000Z",
							lastSeenAt: "2026-11-04T08:30:00.000Z",
							expiresAt: "2026-11-11T08:30:00.000Z",
							isCurrent: true,
						},
					],
				}),
			).toStrictEqual([
				{
					id: 9,
					browser: "Firefox",
					system: null,
					ip: "203.0.113.0/24",
					createdAt: Date.UTC(2026, 10, 3, 10),
					lastSeenAt: Date.UTC(2026, 10, 4, 8, 30),
					expiresAt: Date.UTC(2026, 10, 11, 8, 30),
					isCurrent: true,
				},
			]);
		});

		it("SHOULD give an empty list WHEN the account has no session", () => {
			expect(fromSessionListDtoToSessionFms({ sessions: [] })).toStrictEqual(
				[],
			);
		});
	});
});
