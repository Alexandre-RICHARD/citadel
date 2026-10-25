const UNITS = ["o", "Ko", "Mo", "Go", "To"];
const numberFormat = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 1,
});

// 1536 → « 1,5 Ko » (unités de 1024, comme Docker et qBittorrent)
export function formatBytes(bytes: number): string {
	let value = bytes;
	let unitIndex = 0;
	while (Math.abs(value) >= 1024 && unitIndex < UNITS.length - 1) {
		value /= 1024;
		unitIndex += 1;
	}
	return `${numberFormat.format(value)} ${UNITS[unitIndex]}`;
}
