import { describe, expect, it } from "vitest";

import { regexDictionary } from "./regexDictionary.ts";

describe("regexDictionary.ts", () => {
	describe("decimalInteger", () => {
		it.each(["0", "7", "42", "9007199254740993"])(
			"SHOULD match '%s'",
			(value) => {
				expect(regexDictionary.decimalInteger.test(value)).toBe(true);
			},
		);

		it.each(["", "007", "-1", "+1", "1.0", "1e3", "0x10", " 7", "7 ", "٣"])(
			"SHOULD not match '%s'",
			(value) => {
				expect(regexDictionary.decimalInteger.test(value)).toBe(false);
			},
		);
	});

	describe("urlPathParam", () => {
		it("SHOULD capture the name of every parameter of the URL", () => {
			const names = [
				...":gameId/bosses/:boss_id".matchAll(regexDictionary.urlPathParam),
			].map((match) => match[1]);

			expect(names).toStrictEqual(["gameId", "boss_id"]);
		});
	});

	describe("narrowNoBreakSpace", () => {
		it("SHOULD replace every narrow no-break space but not the other spaces", () => {
			expect(
				"1\u202f234\u202f567\u00a0€ x".replace(
					regexDictionary.narrowNoBreakSpace,
					" ",
				),
			).toBe("1 234 567\u00a0€ x");
		});
	});

	describe("paths", () => {
		it("SHOULD find node_modules and design-system whatever the path separator", () => {
			expect(
				regexDictionary.nodeModulesPath.test(
					"C:\\app\\node_modules\\react\\index.js",
				),
			).toBe(true);
			expect(
				regexDictionary.nodeModulesPath.test(
					"/app/node_modules/react/index.js",
				),
			).toBe(true);
			expect(
				regexDictionary.designSystemPackagePath.test(
					"C:\\repo\\packages\\design-system\\src\\Button.tsx",
				),
			).toBe(true);
		});

		it("SHOULD not match a folder that only contains the name", () => {
			expect(
				regexDictionary.nodeModulesPath.test(
					"/app/my_node_modules_backup/a.js",
				),
			).toBe(false);
		});

		it("SHOULD capture the client project folder", () => {
			expect(
				regexDictionary.clientProjectFolder.exec(
					"/repo/apps/client/src/projects/gameDeathCounter/pages/a.tsx",
				)?.[1],
			).toBe("gameDeathCounter");
		});

		it("SHOULD capture the language and the extension of a translation file", () => {
			const match = regexDictionary.clientTranslationFile.exec(
				"/repo/apps/client/src/projects/test/translations/fr/home.translations.ts",
			);

			expect([match?.[1], match?.[2]]).toStrictEqual(["fr", "ts"]);
		});
	});

	describe("sequelizeUnusedDriver", () => {
		it.each(["pg", "pg-hstore", "mysql2", "sqlite3", "tedious"])(
			"SHOULD match the module '%s'",
			(module) => {
				expect(regexDictionary.sequelizeUnusedDriver.test(module)).toBe(true);
			},
		);

		it.each(["mariadb", "./image.jpg", "my-pg", "pg/lib"])(
			"SHOULD not match the module '%s'",
			(module) => {
				expect(regexDictionary.sequelizeUnusedDriver.test(module)).toBe(false);
			},
		);
	});
});
