// .env.test, à la racine du dépôt : lu par la config Vitest (TEST_SEED) et par les tests d'intégration
export const testEnvFileUrl = new URL(
	"../../../../../.env.test",
	import.meta.url,
);
