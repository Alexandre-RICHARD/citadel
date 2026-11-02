import { buildEmailChangeMail } from "@citadel/server/src/projects/auth/template/buildEmailChangeMail.ts";
import { buildEmailFactorActivationMail } from "@citadel/server/src/projects/auth/template/buildEmailFactorActivationMail.ts";
import { buildMailLoginMail } from "@citadel/server/src/projects/auth/template/buildMailLoginMail.ts";
import { buildPasswordResetMail } from "@citadel/server/src/projects/auth/template/buildPasswordResetMail.ts";
import { buildRegistrationMail } from "@citadel/server/src/projects/auth/template/buildRegistrationMail.ts";
import { buildSecondFactorMail } from "@citadel/server/src/projects/auth/template/buildSecondFactorMail.ts";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MailPreview } from "./MailPreview";

// Les mails à lien et à code de l'authentification : le lien ne marche que dans le navigateur du parcours, le code
// vaut partout
const meta = {
	title: "Mails/Authentification : lien et code",
	component: MailPreview,
} satisfies Meta<typeof MailPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

const PARAMETERS = {
	email: "sam@example.com",
	linkUrl: "https://alexandre-richard.fr/auth/verify?token=exemple",
	code: "482913",
};

export const Registration: Story = {
	args: {
		mail: buildRegistrationMail({ ...PARAMETERS, validityMinutes: 30 }),
	},
};

export const PasswordReset: Story = {
	args: {
		mail: buildPasswordResetMail({ ...PARAMETERS, validityMinutes: 15 }),
	},
};

export const MailLogin: Story = {
	args: {
		mail: buildMailLoginMail({ ...PARAMETERS, validityMinutes: 15 }),
	},
};

export const SecondFactor: Story = {
	args: {
		mail: buildSecondFactorMail({ ...PARAMETERS, validityMinutes: 10 }),
	},
};

export const EmailFactorActivation: Story = {
	args: {
		mail: buildEmailFactorActivationMail({
			...PARAMETERS,
			validityMinutes: 10,
		}),
	},
};

export const EmailChange: Story = {
	args: {
		mail: buildEmailChangeMail({ ...PARAMETERS, validityMinutes: 30 }),
	},
};
