import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../app.ts";
import { allowedHttpMethods } from "../../common/http/allowedHttpMethods.ts";

const GAMES_URL = `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`;

describe("unhandledMethod", () => {
	describe("405 Method Not Allowed", () => {
		it("SHOULD answer METHOD_NOT_ALLOWED with the Allow header WHEN the HTTP method is not handled", async () => {
			// Act : TRACE, car HEAD répondrait sans corps
			const response = await request(app).trace(GAMES_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.METHOD_NOT_ALLOWED);
			expect(response.headers.allow).toBe(allowedHttpMethods.join(", "));
			expect(response.body).toStrictEqual({
				code: TechnicalErrorCodeEnum.METHOD_NOT_ALLOWED,
				message: "HTTP method not handled by the server: TRACE",
			});
		});
	});
});
