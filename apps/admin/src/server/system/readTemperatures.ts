import { readdir, readFile } from "node:fs/promises";

import type { TemperatureReading } from "../../shared/temperatureReading.type.ts";

const THERMAL_DIR = "/sys/class/thermal";

// Les sondes que le noyau expose (processeur, carte mère…), en millièmes de degré.
// /sys est celui du NAS, en lecture seule dans tout conteneur : rien à monter.
// Aucune sonde lisible (selon le matériel) : liste vide, la console n'affiche rien.
export async function readTemperatures(): Promise<TemperatureReading[]> {
	let zones: string[];
	try {
		zones = (await readdir(THERMAL_DIR)).filter((entry) =>
			entry.startsWith("thermal_zone"),
		);
	} catch {
		return [];
	}

	const readings = await Promise.all(
		zones.map(async (zone) => {
			try {
				const [type, temp] = await Promise.all([
					readFile(`${THERMAL_DIR}/${zone}/type`, "utf8"),
					readFile(`${THERMAL_DIR}/${zone}/temp`, "utf8"),
				]);
				return { name: type.trim(), celsius: Number(temp) / 1000 };
			} catch {
				return null;
			}
		}),
	);
	return readings.filter(
		(reading): reading is TemperatureReading =>
			reading !== null &&
			Number.isFinite(reading.celsius) &&
			reading.celsius > 0,
	);
}
