import { describe, expect, it } from "vitest";

import { classifyRequestOrigin } from "./classifyRequestOrigin.ts";
import { RequestOriginEnum } from "./requestOrigin.enum.ts";

const HOST = "citadel.example";

describe("classifyRequestOrigin.ts", () => {
	describe("safe methods", () => {
		it.each(["GET", "HEAD", "OPTIONS", "get"])(
			"SHOULD answer SAFE_METHOD whatever the origin WHEN the method is %s",
			(method) => {
				expect(
					classifyRequestOrigin({
						method,
						origin: "https://evil.example",
						host: HOST,
					}),
				).toBe(RequestOriginEnum.SAFE_METHOD);
			},
		);
	});

	describe("unsafe methods", () => {
		it.each(["POST", "PUT", "PATCH", "DELETE"])(
			"SHOULD answer SAME_HOST WHEN a %s comes from a page of the same host",
			(method) => {
				expect(
					classifyRequestOrigin({
						method,
						origin: `https://${HOST}`,
						host: HOST,
					}),
				).toBe(RequestOriginEnum.SAME_HOST);
			},
		);

		it("SHOULD compare the port too WHEN the host has one", () => {
			expect(
				classifyRequestOrigin({
					method: "POST",
					origin: "http://localhost:3001",
					host: "localhost:3000",
				}),
			).toBe(RequestOriginEnum.FOREIGN);
		});

		it("SHOULD answer MISSING WHEN there is no Origin header", () => {
			expect(
				classifyRequestOrigin({
					method: "POST",
					origin: undefined,
					host: HOST,
				}),
			).toBe(RequestOriginEnum.MISSING);
		});

		it.each([
			{ origin: "https://evil.example", reason: "another host" },
			{ origin: `https://${HOST}.evil.example`, reason: "a lookalike host" },
			{ origin: "null", reason: "an opaque origin" },
			{ origin: "not a url", reason: "an unreadable origin" },
		])("SHOULD answer FOREIGN WHEN the Origin is $reason", ({ origin }) => {
			expect(
				classifyRequestOrigin({ method: "POST", origin, host: HOST }),
			).toBe(RequestOriginEnum.FOREIGN);
		});

		it("SHOULD answer FOREIGN WHEN the request has no Host header", () => {
			expect(
				classifyRequestOrigin({
					method: "POST",
					origin: `https://${HOST}`,
					host: undefined,
				}),
			).toBe(RequestOriginEnum.FOREIGN);
		});
	});
});
