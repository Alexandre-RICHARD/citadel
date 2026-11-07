import type { Page } from "@playwright/test";

import type { ApiAnswer } from "./apiAnswer.type.ts";
import type { ApiCall } from "./apiCall.type.ts";

/**
 * Appelle l'API DEPUIS la page, comme le fait le front : avec les cookies du navigateur, et l'en-tête Origin du site.
 * (Le client HTTP de Playwright ne résout pas `citadel.localhost` sous Windows, le navigateur si.) La page doit déjà être
 * sur le site. Ne lève jamais sur un statut d'erreur : c'est ce que le scénario veut lire
 */
export async function callApi(
	page: Page,
	{ method, path, body }: ApiCall,
): Promise<ApiAnswer> {
	return page.evaluate(
		async ({ method, path, body }) => {
			const response = await fetch(path, {
				method,
				credentials: "same-origin",
				...(body !== undefined && {
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				}),
			});
			const text = await response.text();
			function parseBody(): unknown {
				if (text === "") return null;
				try {
					return JSON.parse(text) as unknown;
				} catch {
					return text;
				}
			}
			return {
				status: response.status,
				data: parseBody(),
				headers: Object.fromEntries(response.headers.entries()),
			};
		},
		{ method, path, body },
	);
}
