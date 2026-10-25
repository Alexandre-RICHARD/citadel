import { describe, expect, it } from "vitest";

import type { PlannableService } from "./plannableService.type.ts";
import { planServiceAction } from "./planServiceAction.ts";
import { ServiceActionEnum } from "./serviceAction.enum.ts";

// La stack média de compose.yml, en miniature
function mediaStack(states: Record<string, string>): PlannableService[] {
	const behindVpn = [{ name: "media-gluetun", waitHealthy: true }];
	return [
		{ name: "media-gluetun", state: states.gluetun ?? "exited", dependsOn: [] },
		{
			name: "media-qbittorrent",
			state: states.qbittorrent ?? "exited",
			dependsOn: behindVpn,
		},
		{
			name: "media-radarr",
			state: states.radarr ?? "exited",
			dependsOn: behindVpn,
		},
		{
			name: "media-cross-seed",
			state: states.crossSeed ?? "exited",
			dependsOn: [...behindVpn, { name: "media-radarr", waitHealthy: false }],
		},
		{
			name: "media-jellyfin",
			state: states.jellyfin ?? "exited",
			dependsOn: [],
		},
	];
}

function summary(steps: ReturnType<typeof planServiceAction>): string[] {
	return steps.map(
		(step) =>
			`${step.operation} ${step.name}${step.waitHealthy ? " (sain)" : ""}`,
	);
}

describe("planServiceAction.ts", () => {
	describe("start", () => {
		it("SHOULD start Gluetun first and wait for it WHEN a service behind the VPN starts while Gluetun is stopped", () => {
			expect(
				summary(
					planServiceAction(
						ServiceActionEnum.START,
						["media-qbittorrent"],
						mediaStack({}),
					),
				),
			).toEqual(["start media-gluetun (sain)", "start media-qbittorrent"]);
		});

		it("SHOULD start only the target WHEN its dependencies already run", () => {
			expect(
				summary(
					planServiceAction(
						ServiceActionEnum.START,
						["media-cross-seed"],
						mediaStack({ gluetun: "running", radarr: "running" }),
					),
				),
			).toEqual(["start media-cross-seed"]);
		});

		it("SHOULD start dependencies before dependents WHEN a whole group starts", () => {
			expect(
				summary(
					planServiceAction(
						ServiceActionEnum.START,
						["media-cross-seed", "media-jellyfin", "media-gluetun"],
						mediaStack({}),
					),
				),
			).toEqual([
				"start media-gluetun (sain)",
				"start media-radarr",
				"start media-cross-seed",
				"start media-jellyfin",
			]);
		});
	});

	describe("stop", () => {
		it("SHOULD stop the running services behind the VPN first WHEN Gluetun stops", () => {
			expect(
				summary(
					planServiceAction(
						ServiceActionEnum.STOP,
						["media-gluetun"],
						mediaStack({
							gluetun: "running",
							qbittorrent: "running",
							radarr: "running",
							crossSeed: "running",
							jellyfin: "running",
						}),
					),
				),
			).toEqual([
				"stop media-cross-seed",
				"stop media-radarr",
				"stop media-qbittorrent",
				"stop media-gluetun",
			]);
		});

		it("SHOULD plan nothing WHEN the target is already stopped", () => {
			expect(
				planServiceAction(
					ServiceActionEnum.STOP,
					["media-jellyfin"],
					mediaStack({}),
				),
			).toEqual([]);
		});
	});

	describe("restart", () => {
		it("SHOULD restart Gluetun and every running service behind it WHEN Gluetun restarts", () => {
			expect(
				summary(
					planServiceAction(
						ServiceActionEnum.RESTART,
						["media-gluetun"],
						mediaStack({ gluetun: "running", qbittorrent: "running" }),
					),
				),
			).toEqual([
				"stop media-qbittorrent",
				"stop media-gluetun",
				"start media-gluetun (sain)",
				"start media-qbittorrent",
			]);
		});

		it("SHOULD simply start the target WHEN it was stopped", () => {
			expect(
				summary(
					planServiceAction(
						ServiceActionEnum.RESTART,
						["media-jellyfin"],
						mediaStack({}),
					),
				),
			).toEqual(["start media-jellyfin"]);
		});
	});
});
