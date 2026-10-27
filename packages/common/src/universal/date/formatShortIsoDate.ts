// « 2013-09-17 » → « 17/09/2013 »
export function formatShortIsoDate(isoDate: string): string {
	const [year, month, day] = isoDate.split("-");
	return `${day}/${month}/${year}`;
}
