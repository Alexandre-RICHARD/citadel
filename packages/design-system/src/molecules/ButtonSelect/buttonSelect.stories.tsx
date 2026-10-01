import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ButtonSelect } from ".";

const meta = {
	title: "Molecules/ButtonSelect",
	component: ButtonSelect,
	args: {
		selectorId: "button-select-story",
		label: "Choisir un jeu",
		onClick: fn(),
	},
} satisfies Meta<typeof ButtonSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
