import { describe, expect, it } from "vitest";

import { LanguageLongCodeEnum } from "../language/languageLongCode.enum.ts";
import { getInvertObject } from "./getInvertObject.ts";

describe("getInvertObject.ts", () => {
	describe("inversion", () => {
		it("SHOULD swap the keys and the values", () => {
			expect(getInvertObject({ fr: "French", en: "English" })).toStrictEqual({
				French: "fr",
				English: "en",
			});
		});

		it("SHOULD map each value of an enum to its key", () => {
			expect(getInvertObject(LanguageLongCodeEnum)).toStrictEqual({
				"fr-FR": "FR",
				"en-US": "EN",
			});
		});

		it("SHOULD return an empty object WHEN the object is empty", () => {
			expect(getInvertObject({})).toStrictEqual({});
		});

		it("SHOULD keep the last key WHEN two keys share the same value", () => {
			expect(getInvertObject({ first: "same", second: "same" })).toStrictEqual({
				same: "second",
			});
		});
	});
});
