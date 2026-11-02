import type { ContactUnsentCountDto } from "@citadel/specs/src/projects/contact/dto/contactUnsentCountDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { countTableRows } from "../../../../testUtils/integration/countTableRows.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { ContactMessageUnsent } from "../../models/ContactMessageUnsent.ts";

const GET_CONTACT_UNSENT_COUNT_URL = `${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.CONTACT}/unsent`;

describe("getContactUnsentCount", () => {
	describe("200 OK", () => {
		it("SHOULD count the kept messages WHEN some contact messages could not be notified", async () => {
			// Arrange
			await ContactMessageUnsent.create({
				subject: "Sujet",
				message: "Message",
				name: null,
				email: null,
			});
			const expectedCount = await countTableRows(
				"mailing_contact_message_unsent",
			);

			// Act
			const response = await request(app).get(GET_CONTACT_UNSENT_COUNT_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as ContactUnsentCountDto).toStrictEqual({
				count: expectedCount,
			});
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD answer like an unknown route WHEN the request came through Caddy", async () => {
			// Act
			const response = await request(app)
				.get(GET_CONTACT_UNSENT_COUNT_URL)
				.set("X-Real-IP", "203.0.113.7");

			// Assert
			expectNotFound(
				response,
				TechnicalErrorCodeEnum.ROUTE_NOT_FOUND,
				`Route not handled by the server: GET ${GET_CONTACT_UNSENT_COUNT_URL}`,
			);
		});
	});
});
