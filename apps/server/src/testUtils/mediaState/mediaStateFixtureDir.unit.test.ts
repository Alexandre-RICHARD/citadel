import { readFileSync } from "node:fs";
import path from "node:path";

import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";
import { mediaSurveySchema } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurveySchema.ts";
import { describe, expect, it } from "vitest";

import { MEDIA_STATE_FIXTURE_DIR } from "./mediaStateFixtureDir.ts";

describe("mediaStateFixtureDir.ts", () => {
	describe("survey", () => {
		it("SHOULD hold a survey that follows the media-state format", () => {
			const content: unknown = JSON.parse(
				readFileSync(
					path.join(MEDIA_STATE_FIXTURE_DIR, MediaStatePathEnum.CURRENT_SURVEY),
					"utf8",
				),
			);
			expect(mediaSurveySchema.safeParse(content).success).toBe(true);
		});
	});
});
