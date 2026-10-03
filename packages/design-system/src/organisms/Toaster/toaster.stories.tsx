import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Toaster } from ".";
import { ToastVariantEnum } from "./toastVariant.enum";

const meta = {
	title: "Organisms/Toaster",
	component: Toaster,
	args: {
		onDismiss: fn(),
		toasts: [
			{
				id: "1",
				variant: ToastVariantEnum.ERROR,
				message: "Impossible d'ajouter la mort : le serveur est injoignable.",
				action: { label: "Réessayer", onClick: fn() },
			},
			{
				id: "2",
				variant: ToastVariantEnum.ERROR,
				message: "Impossible de renommer le jeu : ce jeu n'existe plus.",
			},
			{
				id: "3",
				variant: ToastVariantEnum.SUCCESS,
				message: "La connexion est rétablie.",
			},
			{
				id: "4",
				variant: ToastVariantEnum.INFO,
				message: "Les données ont été mises à jour.",
			},
		],
	},
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Stack: Story = {};

export const Empty: Story = {
	args: {
		toasts: [],
	},
};
