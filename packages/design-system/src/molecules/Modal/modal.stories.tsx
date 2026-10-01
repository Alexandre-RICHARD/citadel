import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Modal } from ".";

const meta = {
	title: "Molecules/Modal",
	component: Modal,
	parameters: {
		layout: "fullscreen",
	},
	args: {
		children: <p>Contenu de la modale</p>,
		onClose: fn(),
		onSubmit: fn(),
	},
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
