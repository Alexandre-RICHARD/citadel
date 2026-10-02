import { checkCookie } from "./checkCookie.ts";
import { setCookie } from "./setCookie.ts";

export const deleteCookie = (name: string): void => {
	if (checkCookie(name)) {
		setCookie({ name, value: "", hours: -1 });
	}
};
