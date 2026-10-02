import { getIsNotNullOrUndefined } from "../../universal/value/getIsNotNullOrUndefined.ts";
import { getCookie } from "./getCookie.ts";

export function checkCookie(name: string): boolean {
	const cookie = getCookie(name);
	return getIsNotNullOrUndefined(cookie);
}
