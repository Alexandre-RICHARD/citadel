import { readCookieValue } from "../../universal/cookie/readCookieValue.ts";

export function getCookie(name: string): string | undefined {
	return readCookieValue(document.cookie, name);
}
