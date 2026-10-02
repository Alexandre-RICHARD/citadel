import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import type { SelectItemsType } from "../../molecules/Dropdown/selectedItems.type";
import { Selector } from ".";

const GAMES: SelectItemsType[] = [
	{ value: "elden-ring", label: "Elden Ring", search: "Elden Ring" },
	{ value: "dark-souls-3", label: "Dark Souls III", search: "Dark Souls III" },
	{ value: "bloodborne", label: "Bloodborne", search: "Bloodborne" },
	{ value: "sekiro", label: "Sekiro", search: "Sekiro" },
];

const meta = {
	title: "Organisms/Selector",
	component: Selector,
	args: {
		id: "game",
		label: "Choisir un jeu",
		items: GAMES,
		selectedItem: undefined,
		position: "bottom-right",
		onSelect: fn(),
	},
	render: (args) => {
		const [, updateArgs] = useArgs<typeof args>();

		return (
			<Selector
				id={args.id}
				label={args.label}
				items={args.items}
				selectedItem={args.selectedItem}
				position={args.position}
				search={args.search}
				onSelect={(selectedItem) => {
					args.onSelect(selectedItem);
					updateArgs({ selectedItem });
				}}
			/>
		);
	},
} satisfies Meta<typeof Selector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearch: Story = {
	args: {
		search: { isHandlingCustomSearch: false },
	},
};

export const OpeningUpward: Story = {
	args: {
		position: "top-right",
	},
	decorators: [
		(Story) => (
			// Laisse de la place au-dessus du bouton pour que le Dropdown s'ouvre vers le haut
			<div style={{ paddingTop: "24rem" }}>
				<Story />
			</div>
		),
	],
};
