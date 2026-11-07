# Tests end-to-end (Playwright)

Ils pilotent un vrai navigateur sur la stack complète de `prod:local` (Caddy, front, serveur, base). Scénarios à écrire : [docs/TODO.md §8](../docs/TODO.md).

## Lancer

Toutes les commandes se lancent **depuis le dossier `e2e/`** (ou avec `pnpm --filter @citadel/e2e <commande>`).

```bash
pnpm stack-up        # 1. la stack (premier lancement : plusieurs minutes, ensuite quelques secondes)
pnpm test-e2e      # 2. tous les tests, sans fenêtre
pnpm test-e2e-report  # 3. ouvre le rapport (aussi proposé automatiquement : e2e/report-e2e/html)
pnpm stack-down      # repartir de zéro : efface la base ET les mails (puis stack-up)
```

Le navigateur est le dossier **EdgeCore** de Windows (détecté tout seul, [src/helpers/browser/findBrowserPath.ts](src/helpers/browser/findBrowserPath.ts)), ou celui de la variable `E2E_BROWSER_PATH`. Sans lui, Playwright prend son propre Chromium (`pnpm install-browser`), que Windows peut bloquer (stratégie de contrôle d'application).

**Adresses et mots de passe** : jamais en dur dans un test, mais dans [src/dictionaries/](src/dictionaries/) (`urls.AUTH_REGISTER`, `credentials.VALID_PASSWORD`...).

| Commande | À quoi ça sert |
|---|---|
| `pnpm test-e2e-ui` | **Le plus confortable** : liste des tests, un clic pour en lancer un, voir chaque étape avec la page « avant / après », rejouer |
| `pnpm test-e2e-slow` | Fenêtre visible, une action toutes les 600 ms : pour **regarder** un test et valider qu'il est correct |
| `pnpm test-e2e src/tests/auth/a1.registrationNominal.spec.ts` | Un seul fichier (un dossier marche aussi : `src/tests/isolation`) |
| `pnpm test-e2e -g "A1"` | Les tests dont le titre contient « A1 » (sans `--` : après lui, `-g` serait pris pour un nom de fichier) |
| `pnpm test-e2e-record` | **Enregistreur** (voir plus bas) |

Tu peux aussi lire les mails reçus par le site sur <http://localhost:8025> (Mailpit), pendant ou après un test.

## Comment les mails sont captés

Le serveur envoie ses mails avec son vrai client Brevo, mais `BREVO_API_URL` (voir [infra/compose.e2e.yml](../infra/compose.e2e.yml)) pointe vers un faux Brevo ([src/fake-brevo/server.mjs](src/fake-brevo/server.mjs)) qui dépose le mail dans Mailpit. **Rien ne part vers Internet, aucun crédit Brevo n'est consommé.** Dans un test :

```ts
const mail = await waitForMail(identity.email); // attend le mail (15 s au plus) et le lit
mail.link;  // le lien vers le site
mail.code;  // le code à 6 chiffres
mail.subject, mail.text, mail.html
```

## La base n'est pas vidée entre les tests

Chaque test crée ses propres données avec `createIdentity()` : un email et un pseudo uniques (`alice-1a2b3c4d@e2e.test`). Deux tests ne se marchent donc pas dessus, même en parallèle, et la suite reste rapide. Pour repartir de zéro : `pnpm stack-down` puis `pnpm stack-up`.

## Écrire un test : le tutoriel

### 1. Enregistrer pour avoir un brouillon

```bash
pnpm stack-up
pnpm test-e2e-record
```

Deux fenêtres s'ouvrent : le navigateur (fais ton parcours dedans) et **Playwright Inspector**, où le code s'écrit au fur et à mesure. Boutons de la barre du navigateur :
- **Assert visibility** (l'œil) : clique ensuite sur un texte pour ajouter une vérification « ce texte est visible » ;
- **Assert text**, **Assert value** : vérifier un texte exact, une valeur de champ ;
- **Record / Pick locator** : voir comment Playwright désigne un élément.

Copie le code de l'Inspector dans un nouveau fichier `src/tests/…/mon-scenario.spec.ts`.

### 2. Le nettoyer

L'enregistreur te donne un brouillon à retoucher à la main :
- **Les valeurs fixes → l'identité du test.** Il a noté `alex@test.fr` en dur : remplace par `createIdentity().email` (sinon le 2ᵉ lancement échoue, l'adresse existe déjà).
- **Le mail → `waitForMail`.** Le navigateur de l'enregistreur ne sait pas lire tes mails : tu ajoutes l'étape à la main.
- **Découper en `test.step`** : c'est ce qui rend l'échec lisible (voir plus bas).
- **Des vérifications `expect`** à chaque étape importante, pas seulement à la fin.

### 3. Le squelette

```ts
import { expect, test } from "@playwright/test";
import { openProjectFromHomepage } from "../../helpers/navigation/openProjectFromHomepage.ts";
import { openSite } from "../../helpers/navigation/openSite.ts";
import { registerAccount } from "../../steps/registerAccount.ts";

test.describe("Mon thème", () => {
	test("B3 : ce qu'on vérifie", async ({ page }) => {
		await test.step("Ouvrir le site puis le formulaire d'inscription", async () => {
			await openSite(page);
			await openProjectFromHomepage(page, "Backlog");
			await page.getByRole("link", { name: "Créer un compte" }).click();
		});

		const identity = await registerAccount(page, "alice");

		await test.step("Deuxième étape, nommée comme tu la raconterais", async () => {
			await expect(page.getByText(identity.username)).toBeVisible();
		});
	});
});
```

Les modèles : [a1.registrationNominal.spec.ts](src/tests/auth/a1.registrationNominal.spec.ts) (un parcours détaillé, avec les steps d'ouverture et de saisie), [e7.manageFactors.spec.ts](src/tests/auth/e7.manageFactors.spec.ts) (un compte prêt à l'emploi, plusieurs steps enchaînés) et [i2.gdcIsolation.spec.ts](src/tests/isolation/i2.gdcIsolation.spec.ts) (deux utilisateurs, appels directs à l'API).

**Les fichiers de tests** sont rangés par thème (`auth`, `access`, `isolation`, `homepage`) et nommés par le code du scénario de [scenarios.md](scenarios.md), en minuscules (la règle ESLint des noms de fichiers l'exige) : `a1.registrationNominal.spec.ts`, `h2.homepageHeader.spec.ts`. Les scénarios écrits y sont marqués ✅.

**Helpers ou steps ?** Dans [src/helpers/](src/helpers/), les petits gestes (ouvrir le site, lire un mail, créer une identité). Dans [src/steps/](src/steps/), les parcours complets d'un utilisateur : `openRegistrationForm`, `registerAccount` (inscription + confirmation par le lien), `registerWithCode` (par le code), `createConnectedAccount` (un compte neuf, connecté, sur la homepage), `createAccountWithTotp`, `logIn`, `logOut`, `enableTotp`, `submitSecondFactor`, `sendContactMessage`… Un step part de la page où il est appelé (précisée dans son commentaire), se découpe en `test.step` et renvoie ce dont la suite a besoin (l'identité créée). Les animations du site restent actives : Playwright attend qu'un élément soit stable avant de cliquer.

### 4. Naviguer comme un utilisateur

Un scénario **ne tape jamais d'adresse** : il représente ce que l'utilisateur fait dans l'interface. Il commence par `openSite(page)` (le site à `/`, qui renvoie vers la homepage), puis il clique : `openProjectFromHomepage(page, "Backlog")`, un lien, un bouton. Le lien d'un mail s'ouvre avec `openMailLink(page, mail.link!)` (l'utilisateur le clique dans sa messagerie). Ces helpers sont dans [src/helpers/navigation/](src/helpers/navigation/) et ce sont les seuls à appeler `goto` : ESLint l'interdit dans `src/tests`.

### 5. Désigner un élément (par ordre de préférence)

1. `page.getByTestId("register-submit")` : le `data-testid`, stable même si le texte change ;
2. `page.getByRole("button", { name: "Créer mon compte" })` : ce que voit un utilisateur ;
3. `page.getByLabel("Adresse email")` pour un champ ;
4. `page.getByText("…")` en dernier recours.

Pas de `waitForTimeout` (attente fixe) : `expect(...).toBeVisible()` attend tout seul jusqu'à 10 s.

### 6. Plusieurs utilisateurs / un autre navigateur

```ts
const alice = await browser.newContext(); // « un autre navigateur » : ni cookies ni stockage partagés
const bob = await browser.newContext();
const pageAlice = await alice.newPage();
```

`page.context().newPage()` ouvre un autre **onglet du même navigateur** (même session) : `openInNewTab(page, chemin)` pour un favori, `openMailLink` pour un lien de mail. Un onglet n'hérite pas du `sessionStorage` des autres.

**Appeler l'API** (isolation entre comptes, états difficiles à atteindre à l'écran) : `callApi(page, { method, path, body })`, qui fait un `fetch` depuis la page (cookies et `Origin` du site). `page.request` ne résout pas `citadel.localhost` sous Windows.

**Codes TOTP** : `computeTotp(secret, décalage)` calcule le code de l'application (`-1`, `0`, `+1` : les pas acceptés). Après un échec, le serveur impose un court délai : `retryUntilAnswered` reprend l'envoi tant qu'il n'y a pas de vraie réponse.

## Quand un test échoue

Le terminal indique **l'étape** (`test.step`) qui a échoué et la ligne exacte :

```
1) [chromium] › auth/a1.registrationNominal.spec.ts › A1 …
   Error: expect(locator).toBeVisible() — Locator: getByRole('heading', { name: 'Confirme ton adresse email' })
   > Étape : L'écran « Confirme ton adresse email » s'affiche
```

Puis `pnpm test-e2e-report` ouvre le rapport HTML. Pour un test échoué :
- la **liste des étapes**, la fautive en rouge ;
- une **capture** de l'écran au moment de l'échec et une **vidéo** du test entier ;
- la **trace** : onglet « Trace », tu fais défiler les actions et vois la page, la console et le réseau à chaque instant.

Pour déboguer à la main : `pnpm test-e2e --debug src/tests/…` exécute pas à pas dans l'Inspector.

## Ce qui est volontairement différent de la prod

Voir [infra/compose.e2e.yml](../infra/compose.e2e.yml) : mails vers le faux Brevo, limites par IP relevées (tous les tests viennent de la même IP). Les durées (parcours de 30 min, renvoi de 60 s…) sont celles de la prod : les scénarios qui exigent des durées raccourcies (B7…) demanderont une configuration à part, à ajouter quand on les écrira.
