export function getLatestDate(dates: (Date | null)[]): Date | null {
	const existingDates = dates.filter((date) => date !== null);
	if (existingDates.length === 0) return null;

	return existingDates.reduce((latestDate, date) =>
		date.getTime() > latestDate.getTime() ? date : latestDate,
	);
}
