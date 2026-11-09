import type { Meta, StoryObj } from "@storybook/react-vite";
import { Castle } from "lucide-react";
import { fn } from "storybook/test";

import { IconLink } from ".";

const meta = {
	title: "Atoms/IconLink",
	component: IconLink,
	args: {
		icon: Castle,
		label: "Retour à la Citadel",
		href: "/homepage",
		onNavigate: fn(),
	},
} satisfies Meta<typeof IconLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
	args: { size: "sm" },
};
