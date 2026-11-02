import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchWithTimeout } from "./fetchWithTimeout.ts";

const SERVICE_URL = "https://service.test/status";

const fetchMock = vi.fn<typeof fetch>();

// Ne répond jamais : seule l'annulation par le signal termine l'appel
function answerOnlyWhenAborted(
	_input: Parameters<typeof fetch>[0],
	init?: RequestInit,
): Promise<Response> {
	return new Promise((_resolve, reject) => {
		init?.signal?.addEventListener("abort", () => {
			// Le motif d'une annulation par AbortSignal.timeout : une DOMException « TimeoutError »
			reject(init.signal?.reason as Error);
		});
	});
}

describe("fetchWithTimeout.ts", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		fetchMock.mockReset();
	});

	describe("request", () => {
		it("SHOULD send the given options with a signal WHEN called", async () => {
			// Arrange
			fetchMock.mockResolvedValueOnce(new Response("ok"));

			// Act
			await fetchWithTimeout(SERVICE_URL, 1000, {
				method: "POST",
				headers: { "X-API-Key": "key" },
			});

			// Assert
			const [calledUrl, init] = fetchMock.mock.calls[0] ?? [];
			expect(calledUrl).toBe(SERVICE_URL);
			expect(init?.method).toBe("POST");
			expect(init?.headers).toStrictEqual({ "X-API-Key": "key" });
			expect(init?.signal).toBeInstanceOf(AbortSignal);
		});
	});

	describe("timeout", () => {
		it("SHOULD fail with a TimeoutError WHEN the service does not answer in time", async () => {
			// Arrange
			fetchMock.mockImplementationOnce(answerOnlyWhenAborted);

			// Act
			const request = fetchWithTimeout(SERVICE_URL, 10);

			// Assert
			await expect(request).rejects.toMatchObject({ name: "TimeoutError" });
		});
	});
});
