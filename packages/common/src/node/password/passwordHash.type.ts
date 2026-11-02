import type { Argon2Parameters } from "./argon2Parameters.type.ts";

// Un hash stocké, relu : ses paramètres, son sel et l'empreinte du mot de passe
export type PasswordHash = {
	parameters: Argon2Parameters;
	salt: Buffer;
	digest: Buffer;
};
