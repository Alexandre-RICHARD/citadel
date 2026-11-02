import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { openTestFlow } from "../../../../testUtils/integration/auth/openTestFlow.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";

const ABANDON_FLOW_URL = `${ApiPrefixEnum.AUTH}/flow`;

async function abandonFlow(cookie?: string) {
	const pending = request(app).delete(ABANDON_FLOW_URL);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

describe("abandonFlow", () => {
	describe("204 No Content", () => {
		it("SHOULD delete the flow of the browser and clear its cookie", async () => {
			// Arrange
			const flow = await openTestFlow();
			const other = await openTestFlow();

			// Act
			const response = await abandonFlow(flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await selectAuthRows.flow(flow.id)).toBeNull();
			expect(await selectAuthRows.flow(other.id)).not.toBeNull();
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Expires=Thu, 01 Jan 1970",
			);
		});

		it.each([
			{ reason: "without any flow cookie", cookie: undefined },
			{
				reason: "twice in a row",
				cookie: `${flowCookie.name}=deja-abandonne`,
			},
		])("SHOULD answer the same $reason", async ({ cookie }) => {
			// Act
			const response = await abandonFlow(cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});
});
