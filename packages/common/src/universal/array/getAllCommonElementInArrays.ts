import { areStrictlyDeeplyEquals } from "../object/areStrictlyDeeplyEquals.ts";
import { getIsPrimitive } from "../value/getIsPrimitive.ts";

export function getAllCommonElementInArrays<T>(array1: T[], array2: T[]): T[] {
	return array1.filter((element) => {
		if (getIsPrimitive(element)) return array2.includes(element);
		return array2.some((obj2) => areStrictlyDeeplyEquals(element, obj2));
	});
}
