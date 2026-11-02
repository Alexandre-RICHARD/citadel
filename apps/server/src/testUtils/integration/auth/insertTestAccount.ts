import { passwordService } from "../../../projects/auth/service/passwordService.ts";
import { buildUniqueWord } from "../buildUniqueWord.ts";
import { insertAuthRows } from "./insertAuthRows.ts";

type Options = {
	loginMethods?: string;
	lastLoginAt?: Date | null;
	// Un TOTP ou un facteur mail actif
	confirmedFactorType?: "totp" | "email" | undefined;
};

type TestAccount = {
	userId: number;
	email: string;
	username: string;
	password: string;
};

// Un compte au vrai mot de passe (hash des paramètres de .env.test), pour s'y connecter. Email et pseudo uniques
export async function insertTestAccount({
	loginMethods = "both",
	lastLoginAt = null,
	confirmedFactorType,
}: Options = {}): Promise<TestAccount> {
	const username = buildUniqueWord();
	const email = `${username.toLowerCase()}@example.com`;
	const password = `mot de passe ${username}`;
	const userId = await insertAuthRows.user({
		email,
		username,
		passwordHash: await passwordService.hash(password),
		loginMethods,
		lastLoginAt,
	});
	if (confirmedFactorType !== undefined)
		await insertAuthRows.factor({
			userId,
			type: confirmedFactorType,
			confirmedAt: new Date(),
		});
	return { userId, email, username, password };
}
