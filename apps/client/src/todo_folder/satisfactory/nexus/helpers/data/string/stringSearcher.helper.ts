import { stringConvertor } from "./stringConvertor.helper";

type Args = {
	searchString: string;
	value: string;
	strictMode?: boolean;
};

export const stringSearcher = ({
	searchString,
	value,
	strictMode = false,
}: Args): boolean => {
	if (strictMode) return value.includes(searchString);
	return stringConvertor(value).includes(stringConvertor(searchString));
};
