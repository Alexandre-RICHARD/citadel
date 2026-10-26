import { z } from "zod";

const envSchema = z.object({
	SERVER_PORT: z.coerce.number().int().positive(),
	// Gravée dans l'image Docker à sa construction (tag git, v2026.10.25) ; "dev" en local
	APP_VERSION: z.string().min(1).default("dev"),

	DB_HOST: z.string().min(1),
	DB_PORT: z.coerce.number().int().positive(),
	DB_USER_NAME: z.string().min(1),
	DB_USER_PASSWORD: z.string(),
	DB_DATABASE_NAME: z.string().min(1),

	// Application Twitch du Backlog (dev.twitch.tv) : le serveur en tire lui-même ses tokens IGDB, renouvelés au besoin
	INTERNET_GAME_DATA_BASE_CLIENT_ID: z.string().min(1),
	INTERNET_GAME_DATA_BASE_CLIENT_SECRET: z.string().min(1),

	LOG_DB: z
		.enum(["true", "false"])
		.default("false")
		.transform((logDb) => logDb === "true"),
});

function parseEnv(): z.infer<typeof envSchema> {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		const invalidVariables = result.error.issues
			.map((issue) => `  - ${issue.path.join(".")} : ${issue.message}`)
			.join("\n");
		console.error(
			`Variables d'environnement invalides (voir .env.example) :\n${invalidVariables}`,
		);
		process.exit(1);
	}

	return result.data;
}

export const env = parseEnv();
