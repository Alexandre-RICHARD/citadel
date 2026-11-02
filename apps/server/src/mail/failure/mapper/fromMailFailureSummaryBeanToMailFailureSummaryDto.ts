import type { MailFailureSummaryDto } from "@citadel/specs/src/projects/mail/dto/mailFailureSummaryDto.type.ts";

import type { MailFailureSummaryBean } from "../mailFailureSummaryBean.type.ts";

export function fromMailFailureSummaryBeanToMailFailureSummaryDto(
	summary: MailFailureSummaryBean,
): MailFailureSummaryDto {
	return {
		windowDays: summary.windowDays,
		count: summary.count,
		lastFailedAt: summary.lastFailedAt?.toISOString() ?? null,
	};
}
