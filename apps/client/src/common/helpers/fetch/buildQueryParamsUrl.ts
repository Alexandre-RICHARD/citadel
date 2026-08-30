import type { QueryParams } from "@specs/specUtils/queryParams.type";

export const buildQueryString = (query?: QueryParams): string => {
	if (!query) return "";
	const searchParams = new URLSearchParams();
	Object.entries(query).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value.forEach((item) => {
				if (item !== undefined && item !== null)
					searchParams.append(key, String(item));
			});
		} else if (value !== undefined && value !== null) {
			searchParams.append(key, String(value));
		}
	});
	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : "";
};
