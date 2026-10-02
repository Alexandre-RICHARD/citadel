import { areStrictlyDeeplyEqualsHelper } from "../object/areStrictlyDeeplyEquals.ts";
import { getIsPrimitiveHelper } from "../value/getIsPrimitive.ts";

export function getAllCommonElementInArraysHelper<T>(
	array1: T[],
	array2: T[],
): T[] {
	return array1.filter((element) => {
		if (getIsPrimitiveHelper(element)) return array2.includes(element);
		return array2.some((obj2) => areStrictlyDeeplyEqualsHelper(element, obj2));
	});
}
