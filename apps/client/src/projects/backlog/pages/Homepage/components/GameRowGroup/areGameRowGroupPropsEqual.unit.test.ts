import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { describe, expect, it } from "vitest";

import { fromUserGameDtoToBacklogRowFm } from "../../../../api/model/fromUserGameDtoToBacklogRowFm";
import { buildUserGameDto } from "../../../../api/testUtils/buildUserGameDto";
import type { TableControls } from "../../tableControls.type";
import type { TablePopover } from "../../tablePopover.type";
import { areGameRowGroupPropsEqual } from "./areGameRowGroupPropsEqual";
import type { GameRowGroupProps } from "./gameRowGroupProps.type";

const controls: Omit<TableControls, "popover"> = {
	isEditMode: false,
	setPopover: () => undefined,
	openModal: () => undefined,
	toggleExpanded: () => undefined,
	filterOnSeries: () => undefined,
};
const columns = [BacklogColumnEnum.NAME];
const cellClassNames = {};

function buildProps(
	overrides: Partial<GameRowGroupProps> & { popover?: TablePopover | null },
): GameRowGroupProps {
	const { popover = null, ...rest } = overrides;
	return {
		row: fromUserGameDtoToBacklogRowFm(buildUserGameDto(7)),
		columns,
		cellClassNames,
		isExpanded: false,
		table: { ...controls, popover },
		...rest,
	};
}

function menuOfGame(gameId: number): TablePopover {
	return { kind: "actionsMenu", gameId, userVersionId: null, pointer: null };
}

describe("areGameRowGroupPropsEqual.ts", () => {
	describe("same display", () => {
		it("SHOULD be true WHEN the table controls are rebuilt with the same content", () => {
			const previous = buildProps({});

			expect(
				areGameRowGroupPropsEqual(previous, {
					...previous,
					table: { ...previous.table },
				}),
			).toBe(true);
		});

		it("SHOULD be true WHEN a popover opens on another game", () => {
			const previous = buildProps({});

			expect(
				areGameRowGroupPropsEqual(previous, {
					...previous,
					table: { ...previous.table, popover: menuOfGame(8) },
				}),
			).toBe(true);
		});
	});

	describe("changed display", () => {
		it("SHOULD be false WHEN the data of the row changes", () => {
			const previous = buildProps({});

			expect(
				areGameRowGroupPropsEqual(previous, {
					...previous,
					row: fromUserGameDtoToBacklogRowFm(buildUserGameDto(7)),
				}),
			).toBe(false);
		});

		it("SHOULD be false WHEN the row is expanded or folded", () => {
			const previous = buildProps({});

			expect(
				areGameRowGroupPropsEqual(previous, { ...previous, isExpanded: true }),
			).toBe(false);
		});

		it("SHOULD be false WHEN the edit mode changes", () => {
			const previous = buildProps({});

			expect(
				areGameRowGroupPropsEqual(previous, {
					...previous,
					table: { ...previous.table, isEditMode: true },
				}),
			).toBe(false);
		});

		it("SHOULD be false WHEN a function of the table changes identity", () => {
			const previous = buildProps({});

			expect(
				areGameRowGroupPropsEqual(previous, {
					...previous,
					table: { ...previous.table, openModal: () => undefined },
				}),
			).toBe(false);
		});

		it("SHOULD be false WHEN a popover opens on the row", () => {
			const previous = buildProps({});

			expect(
				areGameRowGroupPropsEqual(previous, {
					...previous,
					table: { ...previous.table, popover: menuOfGame(7) },
				}),
			).toBe(false);
		});

		it("SHOULD be false WHEN the popover of the row closes", () => {
			const previous = buildProps({ popover: menuOfGame(7) });

			expect(
				areGameRowGroupPropsEqual(previous, {
					...previous,
					table: { ...previous.table, popover: null },
				}),
			).toBe(false);
		});
	});
});
