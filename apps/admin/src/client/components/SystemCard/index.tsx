import { Server } from "lucide-react";

import type { SystemSnapshot } from "../../../shared/systemSnapshot.type";
import { usePolling } from "../../api/usePolling";
import { formatBytes } from "../../format/formatBytes";
import { formatDuration } from "../../format/formatDuration";
import { formatPercent } from "../../format/formatPercent";
import { Card } from "../Card";
import { Meter } from "../Meter";
import { Stat } from "../Stat";
import styles from "./systemCard.module.scss";

const decimalFormat = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 2,
});

export function SystemCard() {
	const { data, error } = usePolling<SystemSnapshot>("/system", 5000);

	if (!data)
		return (
			<Card
				title="NAS"
				icon={Server}
				error={error}
			>
				<p className={styles.muted}>Lecture…</p>
			</Card>
		);

	const usedMemory = data.memoryTotalBytes - data.memoryAvailableBytes;
	return (
		<Card
			title="NAS"
			icon={Server}
			error={error}
		>
			<Meter
				label="Processeur"
				ratio={data.cpuPercent === null ? null : data.cpuPercent / 100}
				valueText={`${formatPercent(data.cpuPercent)} · ${data.cpuCount} cœurs`}
			/>
			<Meter
				label="Mémoire"
				ratio={usedMemory / data.memoryTotalBytes}
				valueText={`${formatBytes(usedMemory)} / ${formatBytes(data.memoryTotalBytes)}`}
			/>
			{data.disks.map((disk) => (
				<Meter
					key={disk.name}
					label={disk.name}
					ratio={(disk.totalBytes - disk.freeBytes) / disk.totalBytes}
					valueText={`${formatBytes(disk.freeBytes)} libres`}
				/>
			))}
			<div className={styles.footer}>
				<Stat label="Allumé depuis">{formatDuration(data.uptimeSeconds)}</Stat>
				<Stat label="Charge (1, 5, 15 min)">
					{data.loadAverage
						.map((load) => decimalFormat.format(load))
						.join(" · ")}
				</Stat>
				{data.temperatures.map((temperature) => (
					<Stat
						key={temperature.name}
						label={`Température ${temperature.name}`}
					>
						{`${Math.round(temperature.celsius)} °C`}
					</Stat>
				))}
			</div>
		</Card>
	);
}
