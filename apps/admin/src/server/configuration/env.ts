import { parsePasswordHash } from "@citadel/common/src/node/password/parsePasswordHash.ts";
import { z } from "zod";

// Toutes viennent de compose.yml : les adresses y sont écrites, les secrets viennent de .env.prod
const envSchema = z.object({
	ADMIN_PORT: z.coerce.number().int().positive(),
	// Gravée dans l'image à sa construction (tag git) ; « dev » hors de Docker
	APP_VERSION: z.string().min(1).default("dev"),
	// Fabriqué par `citadel admin-password` (ou `pnpm admin:password` sur ton PC). Un ancien hash scrypt est refusé
	ADMIN_PASSWORD_HASH: z
		.string()
		.refine(
			(storedHash) => parsePasswordHash(storedHash) !== null,
			"hash argon2id attendu : à refaire avec citadel admin-password",
		),

	// Le filtre devant Docker (infra-socket-proxy), jamais le socket lui-même
	DOCKER_API_URL: z.url(),
	QBITTORRENT_URL: z.url(),
	QBITTORRENT_USER: z.string().min(1),
	QBITTORRENT_PASSWORD: z.string().min(1),
	GLUETUN_URL: z.url(),
	GLUETUN_API_KEY: z.string().min(1),
	JELLYFIN_URL: z.url(),
	JELLYFIN_API_KEY: z.string().min(1),

	// Caddy : ses logs d'accès (par Docker) et ses certificats (par HTTPS), pour le
	// domaine du site, son www. et jellyfin.
	CADDY_CONTAINER: z.string().min(1),
	SITE_DOMAIN: z.string().min(1),
	// Le serveur Express du site, par le réseau Docker : le nombre de mails qui n'ont pas pu partir
	SITE_API_URL: z.url(),

	// /Volume1/citadel/state du NAS, en lecture seule : version en service, historique,
	// jobs, sauvegardes, résultats des demandes
	STATE_DIR: z.string().min(1),
	// Sa seule écriture : les demandes à infra-ops (state/queue du NAS)
	QUEUE_DIR: z.string().min(1),
	// Le bandeau et le mode maintenance du site (state/public du NAS), en lecture seule
	PUBLIC_DIR: z.string().min(1),
	// Un dossier par disque surveillé, monté en lecture seule : seul l'espace libre est lu
	SSD_PATH: z.string().min(1),
	HDD_PATH: z.string().min(1),
});

function parseEnv(): z.infer<typeof envSchema> {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		const invalidVariables = result.error.issues
			.map((issue) => `  - ${issue.path.join(".")} : ${issue.message}`)
			.join("\n");
		console.error(
			`Variables d'environnement invalides (voir compose.yml, service infra-admin) :\n${invalidVariables}`,
		);
		process.exit(1);
	}

	return result.data;
}

export const env = parseEnv();
