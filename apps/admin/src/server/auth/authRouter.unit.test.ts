import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import { hashPassword } from "@citadel/common/src/node/password/hashPassword.ts";
import { OWASP_ARGON2_PARAMETERS } from "@citadel/common/src/node/password/owaspArgon2Parameters.ts";
import express from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const PASSWORD = "le mot de passe de la console";

// Les variables de compose.yml, factices : env.ts les exige toutes dès son import
const CONSOLE_ENV = {
	ADMIN_PORT: "8100",
	DOCKER_API_URL: "http://docker.test",
	QBITTORRENT_URL: "http://qbittorrent.test",
	QBITTORRENT_USER: "user",
	QBITTORRENT_PASSWORD: "password",
	GLUETUN_URL: "http://gluetun.test",
	GLUETUN_API_KEY: "key",
	JELLYFIN_URL: "http://jellyfin.test",
	JELLYFIN_API_KEY: "key",
	CADDY_CONTAINER: "caddy",
	SITE_DOMAIN: "citadel.test",
	SITE_API_URL: "http://site.test",
	STATE_DIR: "/state",
	QUEUE_DIR: "/queue",
	PUBLIC_DIR: "/state/public",
	SSD_PATH: "/state",
	HDD_PATH: "/hdd",
};

let server: Server;
let baseUrl: string;

async function postLogin(password: string): Promise<Response> {
	return fetch(`${baseUrl}/api/login`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ password }),
	});
}

describe("authRouter.ts", () => {
	beforeAll(async () => {
		for (const [name, value] of Object.entries(CONSOLE_ENV))
			vi.stubEnv(name, value);
		vi.stubEnv(
			"ADMIN_PASSWORD_HASH",
			await hashPassword(PASSWORD, OWASP_ARGON2_PARAMETERS),
		);
		vi.spyOn(process.stdout, "write").mockImplementation(() => true);

		// Après les variables : env.ts les lit à son import
		const { authRouter } = await import("./authRouter.ts");
		const { errorHandler } = await import("../http/errorHandler.ts");
		const app = express();
		app.use(express.json());
		app.use(authRouter);
		app.use(errorHandler);
		server = app.listen(0);
		baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
	});

	afterAll(() => {
		server.close();
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	describe("POST /api/login", () => {
		it("SHOULD open a session WHEN the password matches the argon2id hash", async () => {
			// Act
			const response = await postLogin(PASSWORD);

			// Assert
			expect(response.status).toBe(204);
			expect(response.headers.get("set-cookie")).toMatch(
				/^citadel_admin_session=[A-Za-z0-9_-]{43};.*HttpOnly/,
			);
		});

		it("SHOULD refuse without any session WHEN the password differs", async () => {
			// Act
			const response = await postLogin(`${PASSWORD} faux`);

			// Assert
			expect(response.status).toBe(401);
			expect(response.headers.get("set-cookie")).toBeNull();
		});
	});
});
