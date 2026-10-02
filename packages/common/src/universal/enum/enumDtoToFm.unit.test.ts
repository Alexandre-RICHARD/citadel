import { describe, expect, it } from "vitest";

import { LanguageLongCodeEnum } from "../language/languageLongCode.enum.ts";
import { enumDtoToFm } from "./enumDtoToFm.ts";

enum MachineEnum {
	Build_SmelterMk1_C = "Build_SmelterMk1_C",
	Build_ConstructorMk1_C = "Build_ConstructorMk1_C",
}

describe("enumDtoToFm.ts", () => {
	describe("known value", () => {
		it("SHOULD return the enum member WHEN the dto is one of its values", () => {
			expect(
				enumDtoToFm("Build_SmelterMk1_C", MachineEnum, "MachineEnum"),
			).toBe(MachineEnum.Build_SmelterMk1_C);
		});

		it("SHOULD replace the spaces with underscores before searching", () => {
			expect(
				enumDtoToFm("Build ConstructorMk1 C", MachineEnum, "MachineEnum"),
			).toBe(MachineEnum.Build_ConstructorMk1_C);
		});

		it("SHOULD return the member WHEN its value differs from its key", () => {
			expect(
				enumDtoToFm("fr-FR", LanguageLongCodeEnum, "LanguageLongCodeEnum"),
			).toBe(LanguageLongCodeEnum.FR);
		});
	});

	describe("unknown value", () => {
		it("SHOULD throw with the searched value and the enum name WHEN the dto is not a value", () => {
			expect(() =>
				enumDtoToFm("Build Unknown", MachineEnum, "MachineEnum"),
			).toThrow(
				"Invalid dto name [Build_Unknown]: not found in enum MachineEnum",
			);
		});

		it("SHOULD throw WHEN the dto is a key but not a value", () => {
			expect(() =>
				enumDtoToFm("FR", LanguageLongCodeEnum, "LanguageLongCodeEnum"),
			).toThrow("not found in enum LanguageLongCodeEnum");
		});

		it("SHOULD be case sensitive", () => {
			expect(() =>
				enumDtoToFm("build_smeltermk1_c", MachineEnum, "MachineEnum"),
			).toThrow();
		});
	});
});
