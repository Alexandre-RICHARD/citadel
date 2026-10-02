// Valeurs transmises par vitestIntegrationGlobalSetup.ts aux tests (provide / inject)
declare module "vitest" {
	export interface ProvidedContext {
		testSeed: number;
	}
}

export {};
