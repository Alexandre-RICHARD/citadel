import { buildContactAcknowledgementMail } from "@citadel/server/src/projects/contact/template/buildContactAcknowledgementMail.ts";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MailPreview } from "./MailPreview";

// Le mail que reçoit le visiteur qui a donné son adresse : de son message, seul le sujet est repris
const meta = {
	title: "Mails/Contact : accusé de réception",
	component: MailPreview,
} satisfies Meta<typeof MailPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		mail: buildContactAcknowledgementMail(
			"sam@example.com",
			"Une question sur le Backlog",
		),
	},
};

// Relance du soir : l'accusé n'était pas parti, il le dit
export const Delayed: Story = {
	args: {
		mail: buildContactAcknowledgementMail(
			"sam@example.com",
			"Une question sur le Backlog",
			{ isDelayed: true },
		),
	},
};

export const SpecialCharacters: Story = {
	args: {
		mail: buildContactAcknowledgementMail(
			"zoe@example.com",
			"Accents é à ç, emoji 🎮 et <b>balise</b> dans un sujet assez long pour passer à la ligne",
		),
	},
};
