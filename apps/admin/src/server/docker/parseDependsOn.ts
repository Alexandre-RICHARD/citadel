import type { ServiceDependency } from "../../shared/serviceDependency.type.ts";

// Compose écrit les depends_on de compose.yml dans un label de chaque conteneur :
//   com.docker.compose.depends_on = "media-gluetun:service_healthy:true,media-radarr:service_started:false"
// (service:condition:redémarrer avec lui). Les noms sont ceux des services, identiques aux
// noms des conteneurs dans compose.yml.
export function parseDependsOn(label: string | undefined): ServiceDependency[] {
	if (!label) return [];
	return label
		.split(",")
		.map((entry) => entry.split(":"))
		.filter(([name]) => Boolean(name))
		.map(([name, condition]) => ({
			name,
			waitHealthy: condition === "service_healthy",
		}));
}
