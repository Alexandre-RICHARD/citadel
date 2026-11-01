import type { GetMailStatus } from "@citadel/specs/src/projects/mail/endpoint/status/getMailStatus/getMailStatusEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../fetch/fetchHandler";

// Relu toutes les 5 minutes, page ouverte : le formulaire rouvre seul quand le quota du fournisseur retombe à zéro
const REFETCH_INTERVAL_MS = 5 * 60_000;

// Ce que le quota quotidien de mails laisse ouvert : formulaire de contact, puis inscription
export const mailStatusQueryOptions = queryOptions({
	queryKey: ["mail", "status"] as const,
	queryFn: async ({ signal }) =>
		(
			await fetchHandler<GetMailStatus>(
				{
					url: `${ApiPrefixEnum.MAIL}/status`,
					method: HttpMethodEnum.GET,
					protected: false,
				},
				{ signal },
			)
		).data,
	refetchInterval: REFETCH_INTERVAL_MS,
});
