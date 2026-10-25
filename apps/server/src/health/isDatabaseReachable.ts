import { sequelize } from "../configuration/sequelize.ts";

// Au-delà, la base est considérée injoignable : /health doit répondre vite, même base figée
const DATABASE_CHECK_TIMEOUT_MS = 2000;

export async function isDatabaseReachable(): Promise<boolean> {
	let timeout: NodeJS.Timeout | undefined;
	const timeoutReached = new Promise<false>((resolve) => {
		timeout = setTimeout(() => {
			resolve(false);
		}, DATABASE_CHECK_TIMEOUT_MS);
	});

	try {
		// authenticate() envoie un simple SELECT 1+1 à la base
		const databaseCheck = sequelize.authenticate().then(() => true);
		return await Promise.race([databaseCheck, timeoutReached]);
	} catch {
		return false;
	} finally {
		clearTimeout(timeout);
	}
}
