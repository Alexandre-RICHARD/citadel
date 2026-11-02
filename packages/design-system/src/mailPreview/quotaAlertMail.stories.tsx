import { MailThresholdEnum } from "@citadel/server/src/mail/quota/mailThreshold.enum.ts";
import { buildQuotaAlertMail } from "@citadel/server/src/mail/template/buildQuotaAlertMail.ts";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MailPreview } from "./MailPreview";

// Le mail que reçoit `contact` au premier franchissement de chaque seuil du quota quotidien
const meta = {
	title: "Mails/Alerte de quota",
	component: MailPreview,
} satisfies Meta<typeof MailPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

const LIMITS = { registrationStop: 250, contactStop: 280, dailyLimit: 300 };

export const RegistrationClosed: Story = {
	args: {
		mail: buildQuotaAlertMail(MailThresholdEnum.REGISTRATION, 250, LIMITS),
	},
};

export const ContactClosed: Story = {
	args: {
		mail: buildQuotaAlertMail(MailThresholdEnum.CONTACT, 280, LIMITS),
	},
};

export const EverythingClosed: Story = {
	args: {
		mail: buildQuotaAlertMail(MailThresholdEnum.DAILY, 299, LIMITS),
	},
};
