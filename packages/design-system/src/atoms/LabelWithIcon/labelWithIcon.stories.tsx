import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from "../Icon";
import { IconTokenEnum } from "../Icon/iconToken.enum";
import { LabelWithIcon } from ".";

const meta = {
	title: "Atoms/LabelWithIcon",
	component: LabelWithIcon,
	args: {
		image: (
			<Icon
				iconToken={IconTokenEnum.TriangleArrow}
				size={25}
			/>
		),
		label: <p>Libellé accompagné d&apos;une icône</p>,
		position: "left",
	},
} satisfies Meta<typeof LabelWithIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IconOnLeft: Story = {};

export const IconOnRight: Story = {
	args: {
		position: "right",
	},
};
