export const getIsNotNullorUndefined = (value: unknown): boolean => {
	if (value !== null && value !== undefined) {
		return true;
	}
	return false;
};
