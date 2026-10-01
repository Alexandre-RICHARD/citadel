import type { Meta, StoryObj } from "@storybook/react-vite";

import { CacheOverlay } from ".";

const meta = {
	title: "Atoms/CacheOverlay",
	component: CacheOverlay,
	parameters: {
		layout: "fullscreen",
	},
	args: {
		children: <p>Contenu affiché par-dessus la page</p>,
	},
} satisfies Meta<typeof CacheOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
