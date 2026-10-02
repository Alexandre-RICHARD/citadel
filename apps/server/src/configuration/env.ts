import { z } from "zod";

const envSchema = z.object({
	LOCAL_PORT: z.coerce.number().int().positive(),

	CORS_ORIGIN: z
		.string()
		.min(1)
		.transform((corsOrigin) => corsOrigin.split("|")),

	DB_DRIVER: z.literal("mariadb"),
	DB_HOST: z.string().min(1),
	DB_PORT: z.coerce.number().int().positive(),
	DB_USER_NAME: z.string().min(1),
	DB_USER_PASSWORD: z.string(),
	DB_DATABASE_NAME: z.string().min(1),

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
