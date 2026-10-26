// « Fois fini » : le compteur sûr, puis le probable s'il y en a, ex. « 2 (+1 ?) »
export function formatFinishCount(sure: number, probable: number): string {
	return probable === 0 ? String(sure) : `${sure} (+${probable} ?)`;
}
