import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Button } from ".";

const meta = {
	title: "Atoms/Button",
	component: Button,
	args: {
		label: "Valider",
		onClick: fn(),
	},
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullWidth: Story = {
	args: {
		fullWidth: true,
	},
};
