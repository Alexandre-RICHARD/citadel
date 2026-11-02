import { buildContactNotificationMail } from "@citadel/server/src/projects/contact/template/buildContactNotificationMail.ts";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MailPreview } from "./MailPreview";

// Le mail que reçoit `contact` à chaque message du formulaire
const meta = {
	title: "Mails/Contact : notification",
	component: MailPreview,
} satisfies Meta<typeof MailPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

const WRITTEN_AT = new Date("2026-11-01T18:30:00.000Z");

export const WithEmail: Story = {
	args: {
		mail: buildContactNotificationMail(
			{
				subject: "Une question sur le Backlog",
				message:
					"Bonjour,\nComment ajouter un jeu qui n'est pas dans la base ?\n\nMerci !",
				email: "sam@example.com",
				name: "Sam",
			},
			WRITTEN_AT,
		),
	},
};

export const WithoutEmail: Story = {
	args: {
		mail: buildContactNotificationMail(
			{
				subject: "Un message anonyme",
				message: "Je n'ai pas laissé d'adresse.",
				email: null,
				name: null,
			},
			WRITTEN_AT,
		),
	},
};

// Relance du soir d'un message dont l'envoi avait échoué : la date reste celle où le visiteur a écrit
export const Delayed: Story = {
	args: {
		mail: buildContactNotificationMail(
			{
				subject: "Une question sur le Backlog",
				message:
					"Bonjour,\nComment ajouter un jeu qui n'est pas dans la base ?\n\nMerci !",
				email: "sam@example.com",
				name: "Sam",
			},
			WRITTEN_AT,
			{ isDelayed: true },
		),
	},
};

// Tout ce que le visiteur écrit est échappé : le HTML saisi s'affiche tel quel, il ne s'exécute pas
export const SpecialCharacters: Story = {
	args: {
		mail: buildContactNotificationMail(
			{
				subject: "Accents é à ç, emoji 🎮 et <b>balise</b>",
				message:
					'Un <script>alert("x")</script> & des "guillemets", une ligne très longue : ' +
					"mot ".repeat(60),
				email: "sam+test@example.com",
				name: "Zoé <Admin>",
			},
			WRITTEN_AT,
		),
	},
};
