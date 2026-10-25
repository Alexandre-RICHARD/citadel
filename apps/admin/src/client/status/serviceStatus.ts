import type { ServiceItem } from "../../shared/serviceItem.type";
import type { StatusTone } from "./statusTone.type";

// L'état d'un conteneur en une couleur et un mot
export function serviceStatus(service: Pick<ServiceItem, "state" | "health">): {
	tone: StatusTone;
	text: string;
} {
	switch (service.state) {
		case "running":
			if (service.health === "starting")
				return { tone: "warn", text: "Démarrage" };
			if (service.health === "unhealthy")
				return { tone: "danger", text: "En échec" };
			return {
				tone: "ok",
				text: service.health === "healthy" ? "Sain" : "Allumé",
			};
		case "restarting":
			return { tone: "warn", text: "Redémarre" };
		case "paused":
			return { tone: "warn", text: "En pause" };
		case "dead":
			return { tone: "danger", text: "Mort" };
		default:
			return { tone: "idle", text: "Arrêté" };
	}
}
