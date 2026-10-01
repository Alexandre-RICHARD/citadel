import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { fn } from "storybook/test";

import { IconButton } from ".";

const meta = {
	title: "Atoms/IconButton",
	component: IconButton,
	args: {
		icon: Pencil,
		label: "Modifier",
		onClick: fn(),
	},
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ghost: Story = {};

export const Primary: Story = {
	args: { icon: Save, label: "Enregistrer", variant: "primary" },
};

export const Accent: Story = {
	args: { icon: Plus, label: "Ajouter", variant: "accent" },
};

export const Destructive: Story = {
	args: { icon: Trash2, label: "Supprimer", variant: "destructive" },
};

export const Pressed: Story = {
	args: { icon: Check, label: "Marquer comme terminé", pressed: true },
};

export const Small: Story = {
	args: { size: "sm" },
};
