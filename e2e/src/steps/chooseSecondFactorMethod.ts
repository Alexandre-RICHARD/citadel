import { type Page, test } from "@playwright/test";

/** Sur l'étape « Double authentification » : choisit la méthode (« Application », « Code par email » ou « Code de secours ») */
export async function chooseSecondFactorMethod(
	page: Page,
	method: "Application" | "Code par email" | "Code de secours",
): Promise<void> {
	await test.step(`Double authentification : choisir « ${method} »`, async () => {
		await page
			.getByRole("radiogroup", { name: "Méthode de vérification" })
			.getByText(method, { exact: true })
			.click();
	});
}
