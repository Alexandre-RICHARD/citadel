const percentFormat = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 0,
});

// 12.4 → « 12 % » ; null → « – » (pas encore mesuré)
export function formatPercent(value: number | null): string {
	return value === null ? "–" : `${percentFormat.format(value)} %`;
}
