export const stringConvertor = (string: string): string => {
	return string.toLowerCase().replaceAll("_", " ").replace("-", " ").trim();
};
