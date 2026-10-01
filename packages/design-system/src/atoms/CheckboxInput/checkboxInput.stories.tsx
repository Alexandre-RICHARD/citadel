import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { CheckboxInput } from ".";

const meta = {
	title: "Atoms/CheckboxInput",
	component: CheckboxInput,
	args: {
		label: "Afficher les boss vaincus",
		value: false,
		onChange: fn(),
	},
	// Composant contrôlé : useArgs répercute le changement sur la valeur de la story
	render: (args) => {
		const [, updateArgs] = useArgs<typeof args>();

		return (
			<CheckboxInput
				label={args.label}
				value={args.value}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	},
} satisfies Meta<typeof CheckboxInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
	args: {
		value: true,
	},
};
