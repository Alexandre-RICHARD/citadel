import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flame } from "lucide-react";

import { CountBadge } from ".";

const meta = {
	title: "Atoms/CountBadge",
	component: CountBadge,
	args: {
		count: 42,
		icon: Flame,
	},
} satisfies Meta<typeof CountBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Accent: Story = {};

export const Neutral: Story = {
	args: { variant: "neutral" },
};

export const Small: Story = {
	args: { size: "sm" },
};

export const FlickeringIcon: Story = {
	args: { flickerIcon: true },
};
