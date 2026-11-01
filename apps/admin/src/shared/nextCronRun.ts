// Le prochain passage d'une ligne de crontab (minute heure jour mois jour-de-la-semaine),
// à l'heure locale, après `from`. Comprend ce qu'utilise infra/ops/crontab : *, */n,
// nombres, intervalles a-b et listes a,b. null : expression illisible, ou rien dans
// les 8 jours (une ligne mensuelle, que le planning n'a pas).
const SEARCH_LIMIT_MINUTES = 8 * 24 * 60;
const MINUTE_MS = 60_000;
const FIELD_RANGES: [number, number][] = [
	[0, 59],
	[0, 23],
	[1, 31],
	[1, 12],
	[0, 7],
];

function parseField(
	field: string,
	[min, max]: [number, number],
): Set<number> | null {
	const values = new Set<number>();
	for (const part of field.split(",")) {
		const [range = "", stepText] = part.split("/");
		const step = stepText === undefined ? 1 : Number(stepText);
		const [startText = "", endText] =
			range === "*" ? [`${min}`, `${max}`] : range.split("-");
		const start = Number(startText);
		const end =
			endText === undefined
				? stepText === undefined
					? start
					: max
				: Number(endText);
		if (
			![step, start, end].every(Number.isInteger) ||
			step < 1 ||
			start < min ||
			end > max
		)
			return null;
		for (let value = start; value <= end; value += step) values.add(value);
	}
	return values;
}

export function nextCronRun(expression: string, from: Date): Date | null {
	const fields = expression.trim().split(/\s+/);
	if (fields.length !== 5) return null;
	const sets = fields.map((field, index) =>
		parseField(field, FIELD_RANGES[index] ?? [0, 0]),
	);
	const [minutes, hours, days, months, weekdays] = sets;
	if (!minutes || !hours || !days || !months || !weekdays) return null;
	// 7 et 0 : dimanche, les deux s'écrivent
	if (weekdays.has(7)) weekdays.add(0);

	const candidate = new Date(from);
	candidate.setSeconds(0, 0);
	for (let step = 0; step < SEARCH_LIMIT_MINUTES; step += 1) {
		candidate.setTime(candidate.getTime() + MINUTE_MS);
		if (
			minutes.has(candidate.getMinutes()) &&
			hours.has(candidate.getHours()) &&
			days.has(candidate.getDate()) &&
			months.has(candidate.getMonth() + 1) &&
			weekdays.has(candidate.getDay())
		)
			return new Date(candidate);
	}
	return null;
}
