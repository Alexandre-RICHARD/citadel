import { useLocation } from "react-router";

import { isArrayEmpty } from "../../helpers/array/isArrayEmpty";

export function useGetProjectSubPath(): string | null {
	const { pathname } = useLocation();
	const pathnameParts = pathname.split("/").filter(Boolean);
	pathnameParts.shift();
	if (isArrayEmpty(pathnameParts)) return null;
	const endOfPathName = pathnameParts.join("/");
	return endOfPathName;
}
