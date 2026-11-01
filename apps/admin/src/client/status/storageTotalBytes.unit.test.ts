import { describe, expect, it } from "vitest";

import { storageTotalBytes } from "./storageTotalBytes";

const DOCKER = {
	imagesBytes: 1000,
	containersBytes: 200,
	volumesBytes: 30,
	buildCacheBytes: 4,
	reclaimableBytes: 500,
};

describe("storageTotalBytes.ts", () => {
	describe("total", () => {
		it("SHOULD add Docker and the services data WHEN everything was measured", () => {
			expect(
				storageTotalBytes({
					available: true,
					checkedAt: "2026-11-01T17:00:00Z",
					docker: DOCKER,
					appdataBytes: 5000,
					backupsBytes: 900,
					databaseBytes: 42,
				}),
			).toBe(6234);
		});

		it("SHOULD count Docker alone WHEN the services data could not be measured", () => {
			expect(
				storageTotalBytes({
					available: true,
					checkedAt: "2026-11-01T17:00:00Z",
					docker: DOCKER,
					appdataBytes: null,
					backupsBytes: null,
					databaseBytes: null,
				}),
			).toBe(1234);
		});
	});
});
