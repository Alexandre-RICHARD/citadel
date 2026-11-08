/* eslint-disable no-await-in-loop -- les étapes d'un scénario s'enchaînent dans l'ordre : chaque tour attend le précédent */
import { expect, test } from "@playwright/test";

import { callApi } from "../../helpers/api/callApi.ts";
import { openSite } from "../../helpers/navigation/openSite.ts";

type Endpoint = {
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	path: string;
};

// Tous les endpoints marqués `protected: true` dans packages/specs (hors /auth/logout, qui répond à tous), avec un
// identifiant quelconque : sans session, la réponse ne doit jamais dépendre de ce qui existe
const PROTECTED_ENDPOINTS: readonly Endpoint[] = [
	// Auth
	{ method: "GET", path: "/api/auth/me" },
	{ method: "PATCH", path: "/api/auth/me" },
	{ method: "DELETE", path: "/api/auth/me" },
	{ method: "DELETE", path: "/api/auth/me/projects" },
	{ method: "GET", path: "/api/auth/me/export" },
	{ method: "POST", path: "/api/auth/me/email" },
	{ method: "POST", path: "/api/auth/me/password" },
	{ method: "GET", path: "/api/auth/sessions" },
	{ method: "DELETE", path: "/api/auth/sessions" },
	{ method: "DELETE", path: "/api/auth/sessions/others" },
	{ method: "DELETE", path: "/api/auth/sessions/1" },
	{ method: "GET", path: "/api/auth/factors" },
	{ method: "POST", path: "/api/auth/factors/email" },
	{ method: "POST", path: "/api/auth/factors/totp" },
	{ method: "POST", path: "/api/auth/factors/totp/confirm" },
	{ method: "DELETE", path: "/api/auth/factors/1" },
	{ method: "POST", path: "/api/auth/recovery-codes" },
	// Game Death Counter
	{ method: "GET", path: "/api/game-death-counter/games" },
	{ method: "POST", path: "/api/game-death-counter/games" },
	{ method: "GET", path: "/api/game-death-counter/games/1" },
	{ method: "PUT", path: "/api/game-death-counter/games/1" },
	{ method: "DELETE", path: "/api/game-death-counter/games/1" },
	{ method: "PATCH", path: "/api/game-death-counter/games/1/finished" },
	{ method: "POST", path: "/api/game-death-counter/games/1/bosses" },
	{ method: "GET", path: "/api/game-death-counter/bosses/1" },
	{ method: "PUT", path: "/api/game-death-counter/bosses/1" },
	{ method: "DELETE", path: "/api/game-death-counter/bosses/1" },
	{ method: "PATCH", path: "/api/game-death-counter/bosses/1/defeated" },
	{ method: "POST", path: "/api/game-death-counter/bosses/1/deaths" },
	{ method: "PATCH", path: "/api/game-death-counter/deaths/1" },
	{ method: "DELETE", path: "/api/game-death-counter/deaths/1" },
	// Backlog
	{ method: "GET", path: "/api/backlog/overview" },
	{ method: "GET", path: "/api/backlog/games" },
	{ method: "POST", path: "/api/backlog/games" },
	{ method: "GET", path: "/api/backlog/games/1" },
	{ method: "POST", path: "/api/backlog/games/1/imports" },
	{ method: "GET", path: "/api/backlog/user-games" },
	{ method: "POST", path: "/api/backlog/user-games" },
	{ method: "PUT", path: "/api/backlog/user-games/1" },
	{ method: "DELETE", path: "/api/backlog/user-games/1" },
	{ method: "POST", path: "/api/backlog/user-games/1/user-versions" },
	{ method: "PATCH", path: "/api/backlog/user-versions/1" },
	{ method: "DELETE", path: "/api/backlog/user-versions/1" },
	{ method: "PATCH", path: "/api/backlog/user-versions/1/done-dlcs/1" },
	{ method: "GET", path: "/api/backlog/series" },
	{ method: "GET", path: "/api/backlog/series/1/entries" },
	{ method: "PUT", path: "/api/backlog/series/1/entries" },
	// IGDB, relayé par le serveur : la clé d'API ne se prête pas aux inconnus
	{ method: "GET", path: "/api/backlog/igdb/search?query=zelda" },
	{ method: "GET", path: "/api/backlog/igdb/games/1" },
	{ method: "GET", path: "/api/backlog/igdb/games/1/images" },
];

test.describe("Isolation entre comptes", () => {
	test("I1 : sans session, tous les endpoints protégés (auth, Game Death Counter, Backlog, IGDB) répondent 401", async ({
		page,
	}) => {
		await openSite(page);

		await test.step(`${PROTECTED_ENDPOINTS.length} endpoints appelés sans session`, async () => {
			for (const { method, path } of PROTECTED_ENDPOINTS) {
				const answer = await callApi(page, { method, path });
				expect.soft(answer.status, `${method} ${path}`).toBe(401);
			}
		});
	});
});
