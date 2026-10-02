// TODO T => Rajouter la locale pour un tri adapté à la langue voir => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/collation
export function getSortStringValue(
	stringA: string,
	stringB: string,
): -1 | 0 | 1 {
	if (stringA < stringB) {
		return -1;
	}
	if (stringA > stringB) {
		return 1;
	}
	return 0;
}
