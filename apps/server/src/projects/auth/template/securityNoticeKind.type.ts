import type { MailKindEnum } from "../../../mail/mailKind.enum.ts";

export type SecurityNoticeKind = Extract<
	MailKindEnum,
	| MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED
	| MailKindEnum.AUTH_NOTICE_EMAIL_CHANGED
	| MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_ADDED
	| MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_REMOVED
	| MailKindEnum.AUTH_NOTICE_ACCOUNT_DELETED
>;
