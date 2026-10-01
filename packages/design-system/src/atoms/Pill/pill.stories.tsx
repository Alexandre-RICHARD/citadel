import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check } from "lucide-react";

import { Pill } from ".";

const meta = {
	title: "Atoms/Pill",
	component: Pill,
	args: {
		children: "terminé",
	},
} satisfies Meta<typeof Pill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TextOnly: Story = {};

export const WithIcon: Story = {
	args: {
		children: (
			<>
				<Check
					size={12}
					strokeWidth={2.6}
				/>
				terminé
			</>
		),
	},
};
