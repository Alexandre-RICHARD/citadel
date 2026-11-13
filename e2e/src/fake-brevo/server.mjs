// Faux Brevo des tests end-to-end : l'API de Brevo, juste assez pour BrevoClient.
// Il reçoit un envoi d'email au format Brevo et le dépose dans Mailpit, où les tests
// (et toi, sur http://localhost:8025) le lisent. Rien ne sort jamais vers Internet.
//
// Lancé par infra/compose.e2e.yml (Node seul, aucune dépendance).
import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3001);
const mailpitUrl = process.env.MAILPIT_URL ?? "http://e2e-mailpit:8025";

// Corps JSON d'une requête
async function readJson(request) {
	const chunks = [];
	for await (const chunk of request) chunks.push(chunk);
	return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function reply(response, status, body) {
	response.writeHead(status, { "content-type": "application/json" });
	response.end(JSON.stringify(body));
}

// Adresse Brevo { email, name? } → adresse Mailpit { Email, Name }
function toMailpitAddress({ email, name }) {
	return { Email: email, Name: name ?? "" };
}

// Envoi Brevo → envoi Mailpit (POST /api/v1/send) : mêmes champs, autres noms
function toMailpitMessage(brevoMail) {
	return {
		From: toMailpitAddress(brevoMail.sender),
		To: brevoMail.to.map(toMailpitAddress),
		...(brevoMail.replyTo && {
			ReplyTo: [toMailpitAddress(brevoMail.replyTo)],
		}),
		Subject: brevoMail.subject,
		Text: brevoMail.textContent,
		HTML: brevoMail.htmlContent,
		// Le type de l'email (inscription, contact…) : visible dans Mailpit, filtrable par les tests
		Tags: brevoMail.tags ?? [],
	};
}

const server = createServer(async (request, response) => {
	try {
		if (request.method === "POST" && request.url === "/v3/smtp/email") {
			const brevoMail = await readJson(request);
			const mailpitResponse = await fetch(`${mailpitUrl}/api/v1/send`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(toMailpitMessage(brevoMail)),
			});
			if (!mailpitResponse.ok) {
				console.error(`Mailpit a refusé l'email (${mailpitResponse.status})`);
				return reply(response, 502, { code: "mailpit_refused" });
			}
			// Brevo répond 201 avec l'identifiant de l'email
			return reply(response, 201, { messageId: "<fake@e2e>" });
		}

		// Le quota : toujours tous les crédits, donc aucun email n'est jamais compté comme parti
		if (request.method === "GET" && request.url === "/v3/account") {
			return reply(response, 200, {
				plan: [{ creditsType: "sendLimit", credits: 1_000_000 }],
			});
		}

		return reply(response, 404, { code: "not_found" });
	} catch (error) {
		console.error("Erreur du faux Brevo :", error);
		return reply(response, 500, { code: "fake_brevo_error" });
	}
});

server.listen(port, () => {
	console.log(
		`Faux Brevo prêt sur le port ${port}, emails déposés dans ${mailpitUrl}`,
	);
});
