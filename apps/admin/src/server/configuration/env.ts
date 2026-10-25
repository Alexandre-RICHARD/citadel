import { z } from "zod";

// Toutes viennent de compose.yml : les adresses y sont écrites, les secrets viennent de .env.prod
const envSchema = z.object({
	ADMIN_PORT: z.coerce.number().int().positive(),
	// Gravée dans l'image à sa construction (tag git) ; « dev » hors de Docker
	APP_VERSION: z.string().min(1).default("dev"),
	// Fabriqué par `citadel admin-password` (ou `pnpm admin:password` sur ton PC)
	ADMIN_PASSWORD_HASH: z.string().startsWith("scrypt:"),

	// Le filtre devant Docker (infra-socket-proxy), jamais le socket lui-même
	DOCKER_API_URL: z.url(),
	QBITTORRENT_URL: z.url(),
	QBITTORRENT_USER: z.string().min(1),
	QBITTORRENT_PASSWORD: z.string().min(1),
	GLUETUN_URL: z.url(),
	GLUETUN_API_KEY: z.string().min(1),

	// /Volume1/citadel/state du NAS, en lecture seule : version en service, historique
	STATE_DIR: z.string().min(1),
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
