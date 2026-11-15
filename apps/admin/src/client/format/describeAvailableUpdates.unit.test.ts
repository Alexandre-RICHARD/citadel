import { describe, expect, it } from "vitest";

import type { ServiceItem } from "../../shared/serviceItem.type";
import { describeAvailableUpdates } from "./describeAvailableUpdates";

function buildService(overrides: Partial<ServiceItem>): ServiceItem {
	return {
		name: "service",
		label: "Service",
		image: "lscr.io/linuxserver/radarr:1.0.0",
		version: "1.0.0",
		latestVersion: "1.0.0",
		releaseNotesUrl: null,
		...overrides,
	} as ServiceItem;
}

describe("describeAvailableUpdates.ts", () => {
	describe("updates", () => {
		it("SHOULD list the image, both versions and the release notes WHEN a newer version exists", () => {
			const services = [
				buildService({
					image: "tailscale/tailscale:v1.104.4",
					version: "v1.104.4",
					latestVersion: "v1.104.7",
					releaseNotesUrl: "https://example.test/notes",
				}),
			];

			expect(describeAvailableUpdates(services)).toBe(
				"tailscale/tailscale : v1.104.4 → v1.104.7 (https://example.test/notes)",
			);
		});

		it("SHOULD list a single line WHEN two services share the image and the version", () => {
			const services = [
				buildService({
					name: "site-prod-db",
					image: "mariadb:11.8.9",
					version: "11.8.9",
					latestVersion: "13.0.2",
				}),
				buildService({
					name: "site-preprod-db",
					image: "mariadb:11.8.9",
					version: "11.8.9",
					latestVersion: "13.0.2",
				}),
			];

			expect(describeAvailableUpdates(services)).toBe(
				"mariadb : 11.8.9 → 13.0.2",
			);
		});
	});

	describe("nothing to update", () => {
		it("SHOULD return an empty text WHEN everything is up to date, unknown or ours", () => {
			const services = [
				buildService({}),
				buildService({ latestVersion: null }),
				buildService({
					image: "ghcr.io/alexandre-richard/citadel-server:v2026.11.15.01",
					version: "v2026.11.15.01",
					latestVersion: "v2026.11.15.02",
				}),
			];

			expect(describeAvailableUpdates(services)).toBe("");
		});
	});
});
