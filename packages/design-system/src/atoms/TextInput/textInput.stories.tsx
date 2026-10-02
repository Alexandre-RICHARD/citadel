import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { TextInput } from ".";

const meta = {
	title: "Atoms/TextInput",
	component: TextInput,
	args: {
		label: "Nom du jeu",
		value: "",
		onChange: fn(),
	},
	render: (args) => {
		const [, updateArgs] = useArgs<typeof args>();

		return (
			<TextInput
				label={args.label}
				value={args.value}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	},
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
	args: {
		value: "Elden Ring",
	},
};
