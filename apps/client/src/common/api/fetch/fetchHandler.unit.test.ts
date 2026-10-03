import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../error/ApiError";
import { fetchHandler } from "./fetchHandler";

const DOMAIN = "https://api.citadel.test";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function getSentInit(): RequestInit {
	const init = fetchMock.mock.calls[0]?.[1];
	if (init === undefined) throw new Error("fetch was not called");
	return init;
}

async function catchError(promise: Promise<unknown>): Promise<unknown> {
	return promise.then(
		() => {
			throw new Error("The request should have failed");
		},
		(error: unknown) => error,
	);
}

describe("fetchHandler.ts", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		fetchMock.mockReset();
	});

	describe("request", () => {
		it("SHOULD call the URL built from the domain, the path params and the query params", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

			// Act
			await fetchHandler(
				{
					url: "/game-death-counter/games/:id",
					method: HttpMethodEnum.GET,
					protected: false,
					pathParams: { id: 7 },
					queryParams: { page: 2 },
				},
				{ urlDomain: DOMAIN },
			);

			// Assert
			expect(fetchMock).toHaveBeenCalledWith(
				`${DOMAIN}/game-death-counter/games/7?page=2`,
				expect.objectContaining({ method: HttpMethodEnum.GET, body: null }),
			);
		});

		it("SHOULD send neither body nor Content-Type WHEN the method is GET, so the request needs no CORS preflight", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

			// Act
			await fetchHandler(
				{
					url: "/games",
					method: HttpMethodEnum.GET,
					protected: false,
					body: { ignored: true },
				},
				{ urlDomain: DOMAIN },
			);

			// Assert
			const init = getSentInit();
			expect(init.body).toBeNull();
			expect(new Headers(init.headers).has("Content-Type")).toBe(false);
		});

		it("SHOULD send the body as JSON with its Content-Type WHEN the method carries a body", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(jsonResponse(201, {}));

			// Act
			await fetchHandler(
				{
					url: "/games",
					method: HttpMethodEnum.POST,
					protected: false,
					body: { name: "Hades" },
				},
				{ urlDomain: DOMAIN },
			);

			// Assert
			const init = getSentInit();
			expect(init.body).toBe('{"name":"Hades"}');
			expect(new Headers(init.headers).get("Content-Type")).toBe(
				"application/json",
			);
		});

		it("SHOULD send a bearer token WHEN the endpoint is protected", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

			// Act
			await fetchHandler(
				{ url: "/games", method: HttpMethodEnum.GET, protected: true },
				{ urlDomain: DOMAIN },
			);

			// Assert
			expect(new Headers(getSentInit().headers).get("Authorization")).toBe(
				"Bearer FakeToken",
			);
		});

		it("SHOULD pass the abort signal to fetch", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
			const { signal } = new AbortController();

			// Act
			await fetchHandler(
				{ url: "/games", method: HttpMethodEnum.GET, protected: false },
				{ urlDomain: DOMAIN, signal },
			);

			// Assert
			expect(getSentInit().signal).toBe(signal);
		});
	});

	describe("successful responses", () => {
		it("SHOULD return the status and the parsed body WHEN the API answers 200", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(jsonResponse(200, { games: [] }));

			// Act
			const response = await fetchHandler(
				{ url: "/games", method: HttpMethodEnum.GET, protected: false },
				{ urlDomain: DOMAIN },
			);

			// Assert
			expect(response).toStrictEqual({ status: 200, data: { games: [] } });
		});

		it("SHOULD return null data WHEN the API answers 204 without body", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

			// Act
			const response = await fetchHandler(
				{ url: "/games/7", method: HttpMethodEnum.DELETE, protected: false },
				{ urlDomain: DOMAIN },
			);

			// Assert
			expect(response).toStrictEqual({ status: 204, data: null });
		});
	});

	describe("failures", () => {
		it("SHOULD throw an ApiError without status WHEN no response arrives", async () => {
			// Arrange
			const networkError = new TypeError("Failed to fetch");
			fetchMock.mockRejectedValueOnce(networkError);

			// Act
			const error = await catchError(
				fetchHandler(
					{ url: "/games", method: HttpMethodEnum.GET, protected: false },
					{ urlDomain: DOMAIN },
				),
			);

			// Assert
			expect(error).toBeInstanceOf(ApiError);
			expect(error).toMatchObject({
				status: null,
				code: null,
				issues: [],
				cause: networkError,
			});
		});

		it("SHOULD rethrow the abort error untouched WHEN the request is cancelled", async () => {
			// Arrange
			const controller = new AbortController();
			controller.abort();
			const abortError = new DOMException("Aborted", "AbortError");
			fetchMock.mockRejectedValueOnce(abortError);

			// Act
			const error = await catchError(
				fetchHandler(
					{ url: "/games", method: HttpMethodEnum.GET, protected: false },
					{ urlDomain: DOMAIN, signal: controller.signal },
				),
			);

			// Assert
			expect(error).toBe(abortError);
		});

		it("SHOULD throw an ApiError with the code and the issues WHEN the API answers an error body", async () => {
			// Arrange
			const issues = [
				{
					path: ["name"],
					code: ValidationIssueCodeEnum.TOO_LONG,
					limit: 255,
					message: "Name should contain at most 255 characters",
				},
			];
			fetchMock.mockResolvedValueOnce(
				jsonResponse(400, {
					code: TechnicalErrorCodeEnum.VALIDATION_FAILED,
					message: "Parsing of request failed",
					issues,
				}),
			);

			// Act
			const error = await catchError(
				fetchHandler(
					{
						url: "/games",
						method: HttpMethodEnum.POST,
						protected: false,
						body: { name: "a".repeat(256) },
					},
					{ urlDomain: DOMAIN },
				),
			);

			// Assert
			expect(error).toBeInstanceOf(ApiError);
			expect(error).toMatchObject({
				status: 400,
				code: TechnicalErrorCodeEnum.VALIDATION_FAILED,
				issues,
			});
		});

		it("SHOULD throw an ApiError without issues WHEN the error body has none", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(
				jsonResponse(404, { code: "GAME_NOT_FOUND", message: "No game" }),
			);

			// Act
			const error = await catchError(
				fetchHandler(
					{ url: "/games/7", method: HttpMethodEnum.GET, protected: false },
					{ urlDomain: DOMAIN },
				),
			);

			// Assert
			expect(error).toMatchObject({
				status: 404,
				code: "GAME_NOT_FOUND",
				issues: [],
			});
		});

		it.each([
			{
				reason: "is not JSON, like the page of a proxy",
				response: new Response("<html>Bad Gateway</html>", { status: 502 }),
				status: 502,
			},
			{
				reason: "is JSON without code",
				response: jsonResponse(500, { error: "boom" }),
				status: 500,
			},
			{
				reason: "is empty",
				response: new Response(null, { status: 503 }),
				status: 503,
			},
		])(
			"SHOULD keep the real status without code WHEN the error body $reason",
			async ({ response, status }) => {
				// Arrange
				fetchMock.mockResolvedValueOnce(response);

				// Act
				const error = await catchError(
					fetchHandler(
						{ url: "/games", method: HttpMethodEnum.GET, protected: false },
						{ urlDomain: DOMAIN },
					),
				);

				// Assert
				expect(error).toMatchObject({ status, code: null, issues: [] });
			},
		);
	});
});
