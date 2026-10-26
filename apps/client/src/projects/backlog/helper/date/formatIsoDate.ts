// « 2013-09-17 » → « 17/09/2013 »
export function formatIsoDate(date: string): string {
	const [year, month, day] = date.split("-");
	return `${day}/${month}/${year}`;
}
