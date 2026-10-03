import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ErrorState } from ".";

const meta = {
	title: "Molecules/ErrorState",
	component: ErrorState,
	args: {
		message: "Impossible de charger les jeux : le serveur est injoignable.",
	},
} satisfies Meta<typeof ErrorState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Retryable: Story = {
	args: {
		onRetry: fn(),
	},
};

export const Final: Story = {
	args: {
		message: "Impossible de charger le jeu : ce jeu n'existe plus.",
	},
};
