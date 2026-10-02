export function getEarliestDate(dates: (Date | null)[]): Date | null {
	const existingDates = dates.filter((date) => date !== null);
	if (existingDates.length === 0) return null;

	return existingDates.reduce((earliestDate, date) =>
		date.getTime() < earliestDate.getTime() ? date : earliestDate,
	);
}
