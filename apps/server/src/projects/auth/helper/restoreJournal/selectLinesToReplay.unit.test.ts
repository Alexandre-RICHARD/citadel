import { describe, expect, it } from "vitest";

import type { RestoreJournalLineBean } from "../../bean/restoreJournalLineBean.type.ts";
import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";
import { selectLinesToReplay } from "./selectLinesToReplay.ts";

const BACKUP_DATE = new Date("2026-11-05T03:00:00.000Z");

function line(at: string, email: string): RestoreJournalLineBean {
	return {
		at: new Date(at),
		userId: 1,
		username: "alex",
		action: RestoreJournalActionEnum.EMAIL_CHANGED,
		email,
	};
}

describe("selectLinesToReplay.ts", () => {
	describe("selection", () => {
		it("SHOULD drop the lines written before the backup, already in it", () => {
			expect(
				selectLinesToReplay(
					[line("2026-11-05T02:59:59.999Z", "avant@b.fr")],
					BACKUP_DATE,
				),
			).toStrictEqual([]);
		});

		it("SHOULD keep a line written at the very time of the backup", () => {
			const atBackup = line("2026-11-05T03:00:00.000Z", "pendant@b.fr");

			expect(selectLinesToReplay([atBackup], BACKUP_DATE)).toStrictEqual([
				atBackup,
			]);
		});
	});

	describe("order", () => {
		it("SHOULD replay the lines in the order they happened, whatever their files", () => {
			const first = line("2026-11-05T10:00:00.000Z", "premier@b.fr");
			const second = line("2026-11-06T09:00:00.000Z", "second@b.fr");

			expect(selectLinesToReplay([second, first], BACKUP_DATE)).toStrictEqual([
				first,
				second,
			]);
		});
	});
});
