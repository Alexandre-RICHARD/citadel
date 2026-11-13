import { describe, expect, it } from "vitest";

import { buildProfilePath } from "./buildProfilePath";
import { ProfileCategoryEnum } from "./profileCategory.enum";

describe("buildProfilePath.ts", () => {
	describe("paths", () => {
		it.each([
			{
				category: ProfileCategoryEnum.IDENTITY,
				path: "/auth/profile/identity",
			},
			{ category: ProfileCategoryEnum.LOGIN, path: "/auth/profile/login" },
			{
				category: ProfileCategoryEnum.SECURITY,
				path: "/auth/profile/security",
			},
			{ category: ProfileCategoryEnum.DATA, path: "/auth/profile/data" },
			{
				category: ProfileCategoryEnum.PREFERENCES,
				path: "/auth/profile/preferences",
			},
		])("SHOULD lead $category to $path", ({ category, path }) => {
			expect(buildProfilePath(category)).toBe(path);
		});
	});
});
