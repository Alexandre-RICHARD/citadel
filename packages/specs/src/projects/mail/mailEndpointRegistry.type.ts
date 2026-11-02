import type { GetMailFailureSummary } from "./endpoint/failures/getMailFailureSummary/getMailFailureSummaryEndpoint.interface.ts";
import type { GetMailStatus } from "./endpoint/status/getMailStatus/getMailStatusEndpoint.interface.ts";

export type MailEndpointRegistry = GetMailStatus | GetMailFailureSummary;
