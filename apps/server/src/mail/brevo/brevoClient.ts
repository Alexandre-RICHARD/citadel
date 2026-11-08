import { fetchWithTimeout } from "@citadel/common/src/universal/http/fetchWithTimeout.ts";
import { MailErrorCodeEnum } from "@citadel/specs/src/projects/mail/error/mailErrorCode.enum.ts";

import { BadGatewayError } from "../../error/BadGatewayError.ts";
import { NOREPLY_ADDRESS } from "../address/noreplyAddress.ts";
import type { Mail } from "../mail.type.ts";
import type { MailAddress } from "../mailAddress.type.ts";
import type { BrevoAccount } from "./brevoAccount.type.ts";

const REQUEST_TIMEOUT_MS = 10_000;
const DAILY_SEND_LIMIT_CREDITS = "sendLimit";

function unavailable(message: string, cause?: unknown): BadGatewayError {
	return new BadGatewayError(MailErrorCodeEnum.MAIL_UNAVAILABLE, message, {
		cause,
	});
}

function toBrevoAddress({ email, name }: MailAddress) {
	return name === null ? { email } : { email, name };
}

// Le `code` d'une erreur de Brevo (unauthorized, not_enough_credits…), jamais son message, qui peut citer une adresse
async function readErrorCode(response: Response): Promise<string> {
	try {
		const body: unknown = await response.json();
		if (typeof body === "object" && body !== null && "code" in body)
			return String(body.code);
	} catch {
		// Corps vide ou non JSON
	}
	return "no code";
}

/**
 * Seul point de passage vers l'API de Brevo, avec la clé du .env (restreinte aux mails transactionnels et à la
 * lecture du compte). Aucune adresse ni aucun contenu de mail n'apparaît dans un message d'erreur
 */
export class BrevoClient {
	readonly #apiKey: string;

	// Crédits de l'offre par jour, remis à zéro chaque jour. Indépendants de MAIL_DAILY_LIMIT, qu'on abaisse en dev
	readonly #dailyCredits: number;

	// Adresse de l'API (sans « / » final) : celle de Brevo, ou le faux Brevo des tests end-to-end
	readonly #apiUrl: string;

	constructor(apiKey: string, dailyCredits: number, apiUrl: string) {
		this.#apiKey = apiKey;
		this.#dailyCredits = dailyCredits;
		this.#apiUrl = apiUrl;
	}

	async sendEmail(mail: Mail): Promise<void> {
		const response = await this.#request("/smtp/email", {
			method: "POST",
			body: JSON.stringify({
				sender: toBrevoAddress(NOREPLY_ADDRESS),
				// Le suivi d'ouverture ne se coupe pas sur l'offre gratuite : il reste anonyme
				to: [
					{ ...toBrevoAddress(mail.to), contactPixelTrackingConsent: false },
				],
				...(mail.replyTo !== null && {
					replyTo: toBrevoAddress(mail.replyTo),
				}),
				subject: mail.subject,
				textContent: mail.text,
				htmlContent: mail.html,
				tags: [mail.kind],
			}),
		});
		if (!response.ok)
			throw unavailable(
				`Brevo refused the ${mail.kind} mail (${response.status}, ${await readErrorCode(response)})`,
			);
	}

	// Mails partis aujourd'hui, ceux des réponses depuis Gmail compris : Brevo donne ce qu'il en reste
	async getSentToday(): Promise<number> {
		const response = await this.#request("/account", { method: "GET" });
		if (!response.ok)
			throw unavailable(
				`Brevo refused the account request (${response.status}, ${await readErrorCode(response)})`,
			);

		const account = (await response.json()) as BrevoAccount;
		const dailyPlan = account.plan.find(
			(plan) => plan.creditsType === DAILY_SEND_LIMIT_CREDITS,
		);
		if (dailyPlan === undefined)
			throw unavailable("Brevo account has no daily send limit");
		return Math.max(0, this.#dailyCredits - dailyPlan.credits);
	}

	async #request(path: string, init: RequestInit): Promise<Response> {
		try {
			return await fetchWithTimeout(
				`${this.#apiUrl}${path}`,
				REQUEST_TIMEOUT_MS,
				{
					...init,
					headers: {
						"api-key": this.#apiKey,
						"accept": "application/json",
						"content-type": "application/json",
					},
				},
			);
		} catch (error) {
			throw unavailable(`Brevo did not answer on ${path}`, error);
		}
	}
}
