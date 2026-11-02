import { MailKindEnum } from "@citadel/server/src/mail/mailKind.enum.ts";
import { buildEmailChangeAddressTakenMail } from "@citadel/server/src/projects/auth/template/buildEmailChangeAddressTakenMail.ts";
import { buildExistingAccountMail } from "@citadel/server/src/projects/auth/template/buildExistingAccountMail.ts";
import { buildSecurityNoticeMail } from "@citadel/server/src/projects/auth/template/buildSecurityNoticeMail.ts";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MailPreview } from "./MailPreview";

// Les mails de l'authentification sans code : une adresse déjà inscrite, et les notifications de sécurité
const meta = {
	title: "Mails/Authentification : compte et sécurité",
	component: MailPreview,
} satisfies Meta<typeof MailPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

const EMAIL = "sam@example.com";

// Inscription avec une adresse qui a déjà un compte : seul son propriétaire l'apprend
export const ExistingAccount: Story = {
	args: {
		mail: buildExistingAccountMail(
			EMAIL,
			new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
			new Date(),
		),
	},
};

export const EmailChangeAddressTaken: Story = {
	args: { mail: buildEmailChangeAddressTakenMail(EMAIL) },
};

export const PasswordChanged: Story = {
	args: {
		mail: buildSecurityNoticeMail(
			MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED,
			EMAIL,
		),
	},
};

// À l'ancienne adresse
export const EmailChanged: Story = {
	args: {
		mail: buildSecurityNoticeMail(
			MailKindEnum.AUTH_NOTICE_EMAIL_CHANGED,
			EMAIL,
		),
	},
};

export const SecondFactorAdded: Story = {
	args: {
		mail: buildSecurityNoticeMail(
			MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_ADDED,
			EMAIL,
		),
	},
};

export const SecondFactorRemoved: Story = {
	args: {
		mail: buildSecurityNoticeMail(
			MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_REMOVED,
			EMAIL,
		),
	},
};

export const AccountDeleted: Story = {
	args: {
		mail: buildSecurityNoticeMail(
			MailKindEnum.AUTH_NOTICE_ACCOUNT_DELETED,
			EMAIL,
		),
	},
};
