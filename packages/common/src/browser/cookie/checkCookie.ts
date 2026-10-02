import { getIsNotNullorUndefined } from "../../universal/value/getIsNotNullorUndefined.ts";
import { getCookie } from "./getCookie.ts";

export function checkCookie(name: string): boolean {
	const cookie = getCookie(name);
	return getIsNotNullorUndefined(cookie);
}
