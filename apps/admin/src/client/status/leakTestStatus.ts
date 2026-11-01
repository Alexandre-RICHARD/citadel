import type { JobItem } from "../../shared/jobItem.type";
import type { StatusTone } from "./statusTone.type";

// Le dernier test de fuite du VPN (job vpn-leak-test), en une ligne pour la carte VPN :
// le premier contrôle raté s'il a échoué
export function leakTestStatus(job: JobItem | undefined): {
	tone: StatusTone;
	text: string;
} {
	if (!job || job.status === "never")
		return { tone: "idle", text: "jamais lancé" };
	if (job.status === "running") return { tone: "warn", text: "en cours…" };
	if (job.status === "ok") return { tone: "ok", text: "aucune fuite" };
	const failed = job.checks.find((check) => !check.ok);
	return {
		tone: "danger",
		text: failed
			? `${failed.label} : ${failed.detail}`
			: "échoué (voir le log)",
	};
}
