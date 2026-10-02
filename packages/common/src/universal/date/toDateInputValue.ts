function pad(n: number): string {
	return String(n).padStart(2, "0");
}

export function toDateInputValue(iso: string | Date): string {
	const d = new Date(iso);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
