import type { Meta, StoryObj } from "@storybook/react-vite";

import { RequiredMark } from ".";

const meta = {
	title: "Atoms/RequiredMark",
	component: RequiredMark,
} satisfies Meta<typeof RequiredMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Alone: Story = {};

export const AfterLabel: Story = {
	render: () => (
		<label>
			Sujet
			<RequiredMark />
			<input
				type="text"
				required
			/>
		</label>
	),
};
