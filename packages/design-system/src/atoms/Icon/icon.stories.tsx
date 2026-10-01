import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from ".";
import { IconTokenEnum } from "./iconToken.enum";

const DEFAULT_COLOR = "#262626";

const meta = {
	title: "Atoms/Icon",
	component: Icon,
	argTypes: {
		iconToken: {
			control: "select",
			options: Object.values(IconTokenEnum),
		},
		color: {
			control: "color",
		},
	},
	args: {
		iconToken: IconTokenEnum.Arrow,
		size: 48,
		color: DEFAULT_COLOR,
	},
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllIcons: Story = {
	render: (args) => (
		<div style={{ display: "flex", flexWrap: "wrap", gap: "2.4rem" }}>
			{Object.values(IconTokenEnum).map((iconToken) => (
				<figure
					key={iconToken}
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "0.8rem",
					}}
				>
					<Icon
						iconToken={iconToken}
						size={args.size}
						color={args.color ?? DEFAULT_COLOR}
					/>
					<figcaption>{iconToken}</figcaption>
				</figure>
			))}
		</div>
	),
};
