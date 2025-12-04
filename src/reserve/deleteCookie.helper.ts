import { checkCookie } from "../projects/satisfactory/nexus/helpers/cookie/checkCookie.helper";
import { setCookie } from "../projects/satisfactory/nexus/helpers/cookie/setCookie.helper";

export const deleteCookie = (name: string): void => {
	if (checkCookie(name)) {
		setCookie({ name, value: "", hours: -1 });
	}
};
