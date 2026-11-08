import { expect, test } from "@playwright/test";

import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";
import { ApiPathEnum } from "../../helpers/api/apiPath.enum.ts";
import { callApi } from "../../helpers/api/callApi.ts";
import { openInNewTab } from "../../helpers/navigation/openInNewTab.ts";
import { createConnectedAccount } from "../../steps/createConnectedAccount.ts";

type SessionListItem = { id: number; isCurrent: boolean };
type SessionList = { sessions: SessionListItem[] };

test.describe("Connexion", () => {
	test("C6 : connecté, /auth/login renvoie au profil ; une nouvelle connexion remplace l'ancienne session", async ({
		page,
	}) => {
		const identity = await createConnectedAccount(page, "carol");

		await test.step("Un nouvel onglet sur /auth/login est renvoyé vers le profil", async () => {
			const tab = await openInNewTab(page, E2EUrlEnum.AUTH_LOGIN);
			await expect(tab).toHaveURL(new RegExp(`${E2EUrlEnum.AUTH_PROFILE}$`));
			await expect(
				tab.getByRole("heading", { level: 1, name: "Ton profil" }),
			).toBeVisible();
			await tab.close();
		});

		const firstSessionId =
			await test.step("Une seule session ouverte", async () => {
				const answer = await callApi(page, {
					method: "GET",
					path: ApiPathEnum.AUTH_SESSIONS,
				});
				expect(answer.status).toBe(200);
				const sessions = (answer.data as SessionList).sessions;
				expect(sessions).toHaveLength(1);
				return sessions[0]?.id;
			});

		await test.step("Se reconnecter dans le même navigateur : l'ancienne session disparaît de la liste", async () => {
			const login = await callApi(page, {
				method: "POST",
				path: ApiPathEnum.AUTH_LOGIN_PASSWORD,
				body: {
					identifier: identity.email,
					password: identity.password,
					remember: false,
				},
			});
			expect(login.status, "nouvelle connexion").toBeLessThan(300);

			const answer = await callApi(page, {
				method: "GET",
				path: ApiPathEnum.AUTH_SESSIONS,
			});
			const sessions = (answer.data as SessionList).sessions;
			expect(sessions, "une seule session après la reconnexion").toHaveLength(
				1,
			);
			expect(sessions[0]?.id, "nouvelle session").not.toBe(firstSessionId);
			expect(sessions[0]?.isCurrent).toBe(true);
		});
	});
});
