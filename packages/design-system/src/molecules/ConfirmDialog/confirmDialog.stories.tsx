import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ConfirmDialog } from ".";

const meta = {
	title: "Molecules/ConfirmDialog",
	component: ConfirmDialog,
	args: {
		open: true,
		title: "Supprimer « Elden Ring » ?",
		description: "Ses 4 boss et ses 42 morts seront supprimés définitivement.",
		confirmLabel: "Supprimer",
		destructive: true,
		onConfirm: fn(),
		onCancel: fn(),
	},
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Destructive: Story = {};

export const Neutral: Story = {
	args: {
		title: "Marquer le jeu comme terminé ?",
		description: undefined,
		confirmLabel: "Confirmer",
		destructive: false,
	},
};
