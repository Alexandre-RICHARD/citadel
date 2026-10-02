import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Dropdown } from ".";
import type { SelectItemsType } from "./selectedItems.type";

const GAMES: SelectItemsType[] = [
	{ value: "elden-ring", label: "Elden Ring", search: "Elden Ring" },
	{ value: "dark-souls-3", label: "Dark Souls III", search: "Dark Souls III" },
	{ value: "bloodborne", label: "Bloodborne", search: "Bloodborne" },
	{ value: "sekiro", label: "Sekiro", search: "Sekiro" },
];

const meta = {
	title: "Molecules/Dropdown",
	component: Dropdown,
	decorators: [
		(Story) => (
			<div style={{ position: "relative", minHeight: "24rem" }}>
				<Story />
			</div>
		),
	],
	args: {
		selectorId: "dropdown-story",
		items: GAMES,
		selectedItem: undefined,
		position: "bottom-right",
		search: undefined,
		onSelect: fn(),
		onClose: fn(),
	},
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelectedItem: Story = {
	args: {
		selectedItem: "bloodborne",
	},
};

export const WithSearch: Story = {
	args: {
		search: { isHandlingCustomSearch: false },
	},
};

export const WithCustomPlaceholder: Story = {
	args: {
		search: {
			isHandlingCustomSearch: false,
			placeholder: "Filtrer les jeux",
		},
	},
};
