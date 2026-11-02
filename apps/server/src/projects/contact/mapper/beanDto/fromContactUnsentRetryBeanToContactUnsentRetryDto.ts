import type { ContactUnsentRetryDto } from "@citadel/specs/src/projects/contact/dto/contactUnsentRetryDto.type.ts";

import type { ContactUnsentRetryBean } from "../../bean/contactUnsentRetryBean.type.ts";

export function fromContactUnsentRetryBeanToContactUnsentRetryDto(
	contactUnsentRetry: ContactUnsentRetryBean,
): ContactUnsentRetryDto {
	return {
		sentCount: contactUnsentRetry.sentCount,
		remainingCount: contactUnsentRetry.remainingCount,
		stoppedBecause: contactUnsentRetry.stoppedBecause,
	};
}
