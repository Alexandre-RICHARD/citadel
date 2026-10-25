import { describe, expect, it } from "vitest";

import { summarizeAccessLog } from "./summarizeAccessLog.ts";

function accessLine(
	ip: string,
	uri: string,
	options: { host?: string; country?: string; ts?: number } = {},
): string {
	return JSON.stringify({
		level: "info",
		ts: options.ts ?? 1_761_400_000,
		logger: "http.log.access.log0",
		msg: "handled request",
		request: {
			remote_ip: "172.18.0.1",
			client_ip: ip,
			method: "GET",
			host: options.host ?? "alexandre-richard.fr",
			uri,
		},
		status: 200,
		country: options.country ?? "FR",
	});
}

const LOG = [
	accessLine("1.1.1.1", "/", { ts: 1_761_400_000 }),
	accessLine("1.1.1.1", "/app-3f2a.js", { ts: 1_761_400_001 }),
	accessLine("2.2.2.2", "/wp-login.php", { ts: 1_761_400_002, country: "US" }),
	accessLine("3.3.3.3", "/Sessions/Playing/Progress", {
		ts: 1_761_400_003,
		host: "jellyfin.alexandre-richard.fr",
		country: "",
	}),
	accessLine("1.1.1.1", "/api/games", { ts: 1_761_400_004 }),
	'{"level":"info","logger":"tls","msg":"certificate obtained"}',
	"not json",
	"",
].join("\n");

describe("summarizeAccessLog.ts", () => {
	describe("totals", () => {
		it("SHOULD count only access lines WHEN the log mixes other messages", () => {
			const summary = summarizeAccessLog(LOG, 24, 5000);

			expect(summary).toMatchObject({
				requestCount: 5,
				uniqueIpCount: 3,
				scanCount: 1,
				truncated: false,
			});
		});

		it("SHOULD flag the totals as partial WHEN the log reaches the line limit", () => {
			expect(summarizeAccessLog(LOG, 24, 7)).toMatchObject({ truncated: true });
		});

		it("SHOULD rank the most active IPs first WHEN several IPs are seen", () => {
			const summary = summarizeAccessLog(LOG, 24, 5000);

			expect(summary.available && summary.topIps[0]).toEqual({
				ip: "1.1.1.1",
				country: "FR",
				requestCount: 3,
				scanCount: 0,
			});
		});
	});

	describe("recent lists", () => {
		it("SHOULD list site pages and API calls, newest first, WHEN static files and Jellyfin are mixed in", () => {
			const summary = summarizeAccessLog(LOG, 24, 5000);

			expect(
				summary.available && summary.recentRequests.map((entry) => entry.path),
			).toEqual(["/api/games", "/"]);
		});

		it("SHOULD list the scan apart, with its country WHEN a path is suspicious", () => {
			const summary = summarizeAccessLog(LOG, 24, 5000);

			expect(summary.available && summary.recentScans).toEqual([
				{
					at: "2025-10-25T13:46:42.000Z",
					ip: "2.2.2.2",
					country: "US",
					method: "GET",
					host: "alexandre-richard.fr",
					path: "/wp-login.php",
					status: 200,
				},
			]);
		});
	});
});
