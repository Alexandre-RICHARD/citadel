import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { ExpandToggle } from ".";

const meta = {
	title: "Atoms/ExpandToggle",
	component: ExpandToggle,
	args: {
		expanded: false,
		expandLabel: "Déplier",
		collapseLabel: "Replier",
		onToggle: fn(),
	},
	render: (args) => {
		const [, updateArgs] = useArgs<typeof args>();

		return (
			<ExpandToggle
				expanded={args.expanded}
				expandLabel={args.expandLabel}
				collapseLabel={args.collapseLabel}
				size={args.size ?? "md"}
				onToggle={() => {
					args.onToggle();
					updateArgs({ expanded: !args.expanded });
				}}
			/>
		);
	},
} satisfies Meta<typeof ExpandToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = {
	args: { expanded: true },
};

export const Large: Story = {
	args: { size: "lg" },
};
