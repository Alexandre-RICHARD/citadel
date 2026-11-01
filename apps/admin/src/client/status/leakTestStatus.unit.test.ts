import { describe, expect, it } from "vitest";

import type { JobItem } from "../../shared/jobItem.type";
import { leakTestStatus } from "./leakTestStatus";

function job(
	status: JobItem["status"],
	checks: JobItem["checks"] = [],
): JobItem {
	return {
		name: "vpn-leak-test",
		label: "Test de fuite du VPN",
		description: "",
		monitored: true,
		status,
		startedAt: null,
		finishedAt: null,
		checks,
		cron: null,
		nextRunAt: null,
	};
}

describe("leakTestStatus.ts", () => {
	describe("not run", () => {
		it("SHOULD say it never ran WHEN the job is unknown or never ran", () => {
			expect(leakTestStatus(undefined).text).toBe("jamais lancé");
			expect(leakTestStatus(job("never")).tone).toBe("idle");
		});
	});

	describe("result", () => {
		it("SHOULD report no leak WHEN the job succeeded", () => {
			expect(leakTestStatus(job("ok"))).toEqual({
				tone: "ok",
				text: "aucune fuite",
			});
		});

		it("SHOULD show the first failed check WHEN the job failed", () => {
			expect(
				leakTestStatus(
					job("fail", [
						{ label: "IP de sortie", ok: true, detail: "par le VPN" },
						{ label: "DNS", ok: false, detail: "requêtes chez l'opérateur" },
					]),
				),
			).toEqual({ tone: "danger", text: "DNS : requêtes chez l'opérateur" });
		});
	});
});
