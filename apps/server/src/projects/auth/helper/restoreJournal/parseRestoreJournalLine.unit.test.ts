import { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";
import { describe, expect, it } from "vitest";

import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";
import { parseRestoreJournalLine } from "./parseRestoreJournalLine.ts";

const AT = "2026-11-05T21:00:00.000Z";

describe("parseRestoreJournalLine.ts", () => {
	describe("readable", () => {
		it.each([
			{
				line: { at: AT, userId: 1, action: "account_deleted" },
				expected: {
					at: new Date(AT),
					userId: 1,
					action: RestoreJournalActionEnum.ACCOUNT_DELETED,
				},
			},
			{
				line: { at: AT, userId: 2, action: "security_changed" },
				expected: {
					at: new Date(AT),
					userId: 2,
					action: RestoreJournalActionEnum.SECURITY_CHANGED,
				},
			},
			{
				line: {
					at: AT,
					userId: 3,
					action: "project_data_deleted",
					projects: ["backlog"],
				},
				expected: {
					at: new Date(AT),
					userId: 3,
					action: RestoreJournalActionEnum.PROJECT_DATA_DELETED,
					projects: [UserDataProjectEnum.BACKLOG],
				},
			},
			{
				line: { at: AT, userId: 4, action: "email_changed", email: "a@b.fr" },
				expected: {
					at: new Date(AT),
					userId: 4,
					action: RestoreJournalActionEnum.EMAIL_CHANGED,
					email: "a@b.fr",
				},
			},
		])("SHOULD read a $line.action line", ({ line, expected }) => {
			expect(parseRestoreJournalLine(JSON.stringify(line))).toStrictEqual(
				expected,
			);
		});
	});

	describe("unreadable", () => {
		it.each([
			{
				case: "a line cut in the middle",
				text: `{"at":"${AT}","userId":1,"act`,
			},
			{
				case: "an unknown action",
				text: JSON.stringify({ at: AT, userId: 1, action: "password_lost" }),
			},
			{
				case: "an email change without its email",
				text: JSON.stringify({ at: AT, userId: 1, action: "email_changed" }),
			},
			{
				case: "an unknown project",
				text: JSON.stringify({
					at: AT,
					userId: 1,
					action: "project_data_deleted",
					projects: ["satisfactory"],
				}),
			},
			{
				case: "a date that is not one",
				text: JSON.stringify({
					at: "hier",
					userId: 1,
					action: "account_deleted",
				}),
			},
		])("SHOULD give null WHEN the line is $case", ({ text }) => {
			expect(parseRestoreJournalLine(text)).toBeNull();
		});
	});
});
