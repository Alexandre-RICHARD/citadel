import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { BurgerButton } from ".";

const meta = {
	title: "Atoms/BurgerButton",
	component: BurgerButton,
	args: {
		isOpen: false,
		onToggle: fn(),
	},
	render: (args) => {
		const [, updateArgs] = useArgs<typeof args>();

		return (
			<BurgerButton
				isOpen={args.isOpen}
				onToggle={() => {
					args.onToggle();
					updateArgs({ isOpen: !args.isOpen });
				}}
			/>
		);
	},
} satisfies Meta<typeof BurgerButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
	args: { isOpen: true },
};
