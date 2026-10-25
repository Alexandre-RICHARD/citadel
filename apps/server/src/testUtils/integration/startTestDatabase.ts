import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { testEnvFileUrl } from "./testEnvFileUrl.ts";

const composeFilePath = fileURLToPath(
	new URL("../../../../../compose.dev.yml", import.meta.url),
);

// Même fichier compose que la base de dev, mais avec les valeurs de .env.test
const composeArguments = [
	"compose",
	"--file",
	composeFilePath,
	"--env-file",
	fileURLToPath(testEnvFileUrl),
];

function runDockerCompose(commandArguments: string[]): void {
	try {
		execFileSync("docker", [...composeArguments, ...commandArguments], {
			stdio: "pipe",
		});
	} catch (error) {
		const output =
			error instanceof Error && "stderr" in error
				? String(error.stderr)
				: String(error);
		throw new Error(
			`Base de test : échec de « docker ${commandArguments.join(" ")} ». Docker Desktop est-il lancé ?\n${output}`,
			{ cause: error },
		);
	}
}

/**
 * Recrée le conteneur mariadb-test (données en mémoire : la base repart vide),
 * attend qu'il soit prêt, puis applique les migrations avec Flyway, comme en prod.
 */
export function startTestDatabase(): void {
	runDockerCompose([
		"up",
		"--detach",
		"--wait",
		"--force-recreate",
		"mariadb-test",
	]);
	runDockerCompose(["run", "--rm", "flyway-test"]);
}
