import { describe, expect, it, vi } from "vitest";

import { insertAuthRows } from "../../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../../testUtils/integration/auth/selectAuthRows.ts";
import { simulatedDatabaseFailure } from "../../../testUtils/integration/simulatedDatabaseFailure.ts";
import { watchErrorLogs } from "../../../testUtils/integration/watchErrorLogs.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { AuthEvent } from "../models/AuthEvent.ts";
import { authEventService } from "./authEventService.ts";

async function readOnlyEvent(userId: number) {
	const [eventId] = await selectAuthRows.rowIdsByUserId("auth_event", userId);
	return selectAuthRows.event(eventId ?? 0);
}

describe("authEventService", () => {
	describe("record", () => {
		it("SHOULD write the event with a truncated IPv4 WHEN a login succeeds", async () => {
			// Arrange
			const userId = await insertAuthRows.user();

			// Act
			await authEventService.record({
				type: AuthEventTypeEnum.LOGIN_SUCCEEDED,
				userId,
				client: { ip: "203.0.113.42", userAgent: "Firefox" },
			});

			// Assert
			expect(await readOnlyEvent(userId)).toMatchObject({
				userId,
				type: "login_succeeded",
				ip: "203.0.113.0/24",
				userAgent: "Firefox",
			});
		});

		it("SHOULD keep the /48 only WHEN the IP is an IPv6", async () => {
			// Arrange
			const userId = await insertAuthRows.user();

			// Act
			await authEventService.record({
				type: AuthEventTypeEnum.LOGIN_FAILED,
				userId,
				client: { ip: "2001:db8:aa:bb::1", userAgent: null },
			});

			// Assert
			expect(await readOnlyEvent(userId)).toMatchObject({
				ip: "2001:db8:aa::/48",
				userAgent: null,
			});
		});

		it("SHOULD truncate the user agent to the column WHEN it is longer", async () => {
			// Arrange
			const userId = await insertAuthRows.user();

			// Act
			await authEventService.record({
				type: AuthEventTypeEnum.PASSWORD_CHANGED,
				userId,
				client: { ip: "203.0.113.42", userAgent: "a".repeat(300) },
			});

			// Assert
			expect((await readOnlyEvent(userId))?.userAgent).toBe("a".repeat(255));
		});

		it("SHOULD log the failure without throwing WHEN the journal cannot be written", async () => {
			// Arrange
			const errorLogWatcher = await watchErrorLogs();
			vi.spyOn(AuthEvent, "create").mockRejectedValueOnce(
				simulatedDatabaseFailure(),
			);

			// Act
			const recording = authEventService.record({
				type: AuthEventTypeEnum.LOGIN_FAILED,
				userId: null,
				client: { ip: "203.0.113.42", userAgent: null },
			});

			// Assert
			await expect(recording).resolves.toBeUndefined();
			await errorLogWatcher.expectLogged({
				errorType: "DatabaseError",
				message: "[Journal de sécurité] Failed to insert auth event",
			});
		});
	});
});
