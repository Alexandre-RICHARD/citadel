import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { RangeInput } from ".";

const meta = {
	title: "Atoms/RangeInput",
	component: RangeInput,
	args: {
		label: "Overclocking",
		value: 100,
		min: 1,
		max: 250,
		step: 1,
		onChange: fn(),
	},
	// Composant contrôlé : useArgs répercute le déplacement sur la valeur de la story
	render: (args) => {
		const [, updateArgs] = useArgs<typeof args>();

		return (
			<RangeInput
				label={args.label}
				value={args.value}
				min={args.min}
				max={args.max}
				step={args.step}
				unit={args.unit ?? ""}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	},
} satisfies Meta<typeof RangeInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutUnit: Story = {};

export const WithUnit: Story = {
	args: {
		unit: "%",
	},
};
